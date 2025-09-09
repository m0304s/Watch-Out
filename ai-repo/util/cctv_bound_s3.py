import cv2, torch, re, time, numpy as np
from pathlib import Path
import logging, json, os
from collections import Counter
from util.s3 import upload_jpeg_bytes
# ===== 경로 / 설정 =====
BASE_DIR = Path(__file__).parent.parent
REPO_DIR = BASE_DIR / "yolactMaster"
WEIGHTS  = BASE_DIR / "weights/yolact_resnet101_safety_33_200000.pth"
SCORE_THRESHOLD = 0.3
TOP_K = 100
USE_ALLOWED_FILTER = False
ALLOWED = {"Helmet on","Helmet off","Belt on","Belt off"}
LABELMAP_PATH = BASE_DIR / "labelmap.txt"

import sys
sys.path.insert(0, str(REPO_DIR))
from data.config import cfg, set_cfg
from yolact import Yolact
from utils.augmentations import FastBaseTransform
from layers.output_utils import postprocess

_net = None
_device = None
_class_names = None

def _pick_config_from_weights(weights_path: str) -> str:
    sd = torch.load(weights_path, map_location='cpu')
    stage3_idx = [int(m.group(1)) for k in sd for m in [re.match(r"backbone\.layers\.2\.(\d+)\.", k)] if m]
    backbone = "resnet101" if (max(stage3_idx) if stage3_idx else -1) >= 22 else "resnet50"

    num_classes = None
    if "semantic_seg_conv.bias" in sd:
        num_classes = sd["semantic_seg_conv.bias"].numel()
    else:
        for k, v in sd.items():
            if k.endswith("conf_layer.weight") and v.dim() == 4:
                num_classes = v.shape[0] // 3
                break

    if num_classes in (45, 46):
        return "yolact_resnet101_safety_config" if backbone=="resnet101" else "yolact_resnet50_safety_config"
    elif num_classes in (80, 81):
        return "yolact_resnet101_config" if backbone=="resnet101" else "yolact_resnet50_config"
    else:
        return "yolact_resnet101_safety_config" if backbone=="resnet101" else "yolact_resnet50_safety_config"

def _load_class_names_from_labelmap(default_names):
    if LABELMAP_PATH.exists():
        names = [x.strip() for x in LABELMAP_PATH.read_text(encoding="utf-8").splitlines() if x.strip()]
        if len(names) == len(default_names):
            print("[INFO] Using labelmap.txt class order.")
            return names
        print("[WARN] labelmap.txt length mismatch. Using cfg.dataset.class_names.")
    return default_names

def init_model():
    """Lazy singleton init; 서버 스타트업에서 1회 호출 권장"""
    global _net, _device, _class_names
    if _net is not None:
        return

    config = _pick_config_from_weights(str(WEIGHTS))
    print(f"[AUTO] Picked CONFIG: {config}")
    set_cfg(config)
    cfg.mask_proto_debug = False

    net = Yolact()
    net.load_weights(str(WEIGHTS))
    net.eval()
    net.detect.use_fast_nms = True
    net.detect.use_cross_class_nms = False

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    net = net.to(device)

    class_names = _load_class_names_from_labelmap(list(cfg.dataset.class_names))
    print(f"CFG NAME    : {cfg.name}")
    print(f"BACKBONE    : {cfg.backbone.name}")
    print(f"NUM_CLASSES : {len(class_names)}")

    _net, _device, _class_names = net, device, class_names

def open_capture(src):
    """
    src: int(0/1/2...) 또는 rtsp/http/file 경로(str)
    Windows에서 int 소스는 CAP_DSHOW 사용
    """
    if isinstance(src, int):
        cap = cv2.VideoCapture(src, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        return None
    return cap

def infer_one(frame_bgr):
    """단일 프레임에 YOLACT 추론 후 시각화된 프레임과 탐지 리스트 반환"""
    net, device, class_names = _net, _device, _class_names
    if net is None:
        raise RuntimeError("Model not initialized. Call init_model().")

    frame_tensor = torch.from_numpy(frame_bgr).float()
    batch = FastBaseTransform()(frame_tensor.unsqueeze(0)).to(device)
    with torch.no_grad():
        preds = net(batch)

    h, w = frame_bgr.shape[:2]
    res = postprocess(
        preds, w, h,
        visualize_lincomb=False,
        crop_masks=True,
        score_threshold=SCORE_THRESHOLD
    )

    classes = res[0].detach().cpu().numpy()
    scores  = res[1].detach().cpu().numpy()
    boxes   = res[2].detach().cpu().numpy()
    masks   = res[3].detach().cpu().numpy() if res[3] is not None else None

    vis = frame_bgr.copy()
    dets = []  # ← JSON/트리거용 구조: [{'class': str, 'score': float, 'bbox':[x1,y1,x2,y2]}, ...]

    for i in range(min(TOP_K, scores.shape[0])):
        sc = float(scores[i])
        if sc < SCORE_THRESHOLD:
            continue

        cls_id = int(classes[i])
        if not (0 <= cls_id < len(class_names)):
            continue

        name = class_names[cls_id]
        if USE_ALLOWED_FILTER and name not in ALLOWED:
            continue

        x1, y1, x2, y2 = boxes[i].astype(int)
        # JSON용 기록
        dets.append({
            "class": name,
            "score": sc,
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
        })

        # 시각화
        cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(vis, f"{name}:{sc:.2f}", (x1, max(0, y1-6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        if masks is not None and i < masks.shape[0]:
            m = (masks[i] > 0.5).astype(np.uint8) * 80
            colored = np.zeros_like(vis); colored[:, :, 1] = m
            vis = cv2.addWeighted(vis, 1.0, colored, 0.4, 0)

    return vis, dets

TRIGGERS = {"Helmet on", "Helmet off", "Belt on", "Belt off"}  # 원하면 수정
SNAPSHOT_DIR = "./snapshot"
SNAPSHOT_COOLDOWN = 60.0  # 1분

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def mjpeg_generator(src=0, mirror=True):
    init_model()

    cap = open_capture(src)
    if cap is None:
        return  # 빈 yield 금지

    last_shot_ts = 0.0  # 전역 쿨다운

    try:
        while True:
            ok, frame_bgr = cap.read()
            if not ok or frame_bgr is None or frame_bgr.size == 0:
                break

            if mirror:
                frame_bgr = cv2.flip(frame_bgr, 1)

            vis, dets = infer_one(frame_bgr)

            # --- 트리거 집계(클래스별 개수) ---
            counts = Counter(d["class"] for d in dets if d["class"] in TRIGGERS)

            # --- JPEG 인코딩 (업로드 & 스트림에서 재사용) ---
            ok, buf = cv2.imencode(".jpg", vis)
            if not ok:
                continue
            jpg_bytes = buf.tobytes()

            # --- 스냅샷 & 로그 (1분 쿨다운) ---
            now = time.time()
            if counts and (now - last_shot_ts) >= SNAPSHOT_COOLDOWN:
                last_shot_ts = now
                # 파일명/프리픽스 구성 (원하면 날짜/소스 포함으로 변경)
                classes_str = "_".join(sorted(counts.keys()))[:80]
                fname = f"{int(now*1000)}_{classes_str}.jpg"

                try:
                    # S3 업로드 → key/url 획득
                    s3_key, s3_url = upload_jpeg_bytes(
                        jpg_bytes,
                        prefix="captures/",      # 필요시 f"captures/{time.strftime('%Y/%m/%d')}/{str(src).replace(':','_')}/"
                        filename=fname,
                    )

                    payload = {
                        "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(now)),
                        "src": str(src),
                        "s3_key": s3_key,           # DB에는 이걸 저장 권장
                        "s3_url": s3_url,           # 임시 접근(만료됨)
                        "detections": dict(counts), # 클래스별 개수
                    }
                    logging.info(json.dumps(payload, ensure_ascii=False))
                except Exception as e:
                    logging.error(f"S3 upload failed: {e}")

            # --- MJPEG 전송 (인코딩했던 바이트 재사용) ---
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + jpg_bytes + b"\r\n")

    finally:
        cap.release()