# util/cctv_bound.py
import cv2, torch, re, time, numpy as np
from pathlib import Path
import logging, json, os, math, hashlib  # [KAFKA] hashlib 추가 (eventId 생성용)
from collections import Counter
from datetime import datetime, timezone
from botocore.config import Config

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except Exception:
    pass

# ===== 경로 / 설정 =====
BASE_DIR = Path(__file__).parent.parent
REPO_DIR = BASE_DIR / "yolactMaster"
WEIGHTS  = BASE_DIR / "weights/yolact_resnet101_safety_33_200000.pth"
SCORE_THRESHOLD = 0.3
TOP_K = 100
USE_ALLOWED_FILTER = False
ALLOWED = {"Helmet on","Helmet off","Belt on","Belt off"}
LABELMAP_PATH = BASE_DIR / "labelmap.txt"

# 스냅샷/알림 설정
TRIGGERS = {"Helmet on", "Helmet off", "Belt on", "Belt off"}
SNAPSHOT_DIR = "./snapshot"
SNAPSHOT_COOLDOWN = 60.0
NOTICE_SECS = 5.0

# 로깅
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

# [KAFKA] 이벤트 토픽 이름
KAFKA_TOPIC_EVENTS = os.getenv("KAFKA_TOPIC_EVENTS", "cctv.events")

# ===== YOLACT 로드 =====
import sys
sys.path.insert(0, str(REPO_DIR))
from data.config import cfg, set_cfg
from yolact import Yolact
from utils.augmentations import FastBaseTransform
from layers.output_utils import postprocess

# [KAFKA] 프로듀서 유틸
try:
    from util.kafka_client import send_json  # 없으면 ImportError → 그냥 로그만 남고 동작
    _kafka_ok = True
except Exception as e:
    logging.warning(f"Kafka disabled (producer import failed): {e}")
    _kafka_ok = False

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
    if isinstance(src, int):
        cap = cv2.VideoCapture(src, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        return None
    return cap

def infer_one(frame_bgr):
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
    dets = []

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
        dets.append({
            "class": name,
            "score": sc,
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
        })

        cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(vis, f"{name}:{sc:.2f}", (x1, max(0, y1-6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        if masks is not None and i < masks.shape[0]:
            m = (masks[i] > 0.5).astype(np.uint8) * 80
            colored = np.zeros_like(vis); colored[:, :, 1] = m
            vis = cv2.addWeighted(vis, 1.0, colored, 0.4, 0)

    return vis, dets

# ====== S3 설정/업로드 ======
def _s3_cfg():
    bucket = os.getenv("S3_BUCKET", "").strip()
    region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")
    do_presign = (os.getenv("S3_PRESIGN", "0").lower() in ("1", "true", "yes"))
    presign_ex = int(os.getenv("S3_PRESIGN_EX", "3600"))
    prefix = os.getenv("S3_PREFIX", "").strip()
    return {"bucket": bucket, "region": region, "do_presign": do_presign, "presign_ex": presign_ex, "prefix": prefix}

_s3 = None
def _get_s3():
    global _s3
    if _s3 is None:
        try:
            import boto3
            cfg = _s3_cfg()
            boto_cfg = Config(signature_version="s3v4", retries={"max_attempts": 5, "mode": "standard"})
            _s3 = boto3.client("s3", region_name=cfg["region"], config=boto_cfg) if cfg["region"] else boto3.client("s3", config=boto_cfg)
        except Exception as e:
            logging.error(f"S3 client init failed: {e}")
            _s3 = False
    return _s3

def _save_jpeg_to_s3(image_bgr, key):
    cfg = _s3_cfg()
    if not cfg["bucket"]:
        return None
    s3 = _get_s3()
    if not s3:
        return None
    ok, buf = cv2.imencode(".jpg", image_bgr)
    if not ok:
        return None
    try:
        s3.put_object(
            Bucket=cfg["bucket"],
            Key=key,
            Body=buf.tobytes(),
            ContentType="image/jpeg",
        )
        url = None
        if cfg["do_presign"]:
            url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": cfg["bucket"], "Key": key},
                ExpiresIn=cfg["presign_ex"],
            )
        return {"s3_uri": f"s3://{cfg['bucket']}/{key}", "url": url}
    except Exception as e:
        logging.error(f"S3 upload failed: {e}")
        return None

def _save_jpeg_local(image_bgr, fpath):
    os.makedirs(os.path.dirname(fpath), exist_ok=True)
    cv2.imwrite(fpath, image_bgr)
    return {"path": fpath}

# ===== 알림(오버레이) 유틸 =====
def _draw_notice(vis, lines, alpha=0.65, pad=10):
    if not lines:
        return vis
    overlay = vis.copy()
    x0, y0 = 12, 12
    widths = []
    line_h = 0
    for t in lines:
        (w, h), _ = cv2.getTextSize(t, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        widths.append(w)
        line_h = max(line_h, h)
    box_w = max(widths) + pad * 2
    box_h = line_h * len(lines) + pad * 2 + (len(lines)-1) * 6
    cv2.rectangle(overlay, (x0, y0), (x0 + box_w, y0 + box_h), (0, 0, 0), -1)
    vis = cv2.addWeighted(overlay, alpha, vis, 1 - alpha, 0)
    y = y0 + pad + line_h
    for t in lines:
        cv2.putText(vis, t, (x0 + pad, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        y += line_h + 6
    return vis

# ===== 스트림 제너레이터 =====
def mjpeg_generator(src=0, mirror=True, meta=None):
    """
    단일 소스 스트림: 트리거 시 S3 저장(실패 시 로컬) + 화면 알림(5초)
    meta: {"company": str | None, "camera": str | None}
    """
    init_model()
    os.makedirs(SNAPSHOT_DIR, exist_ok=True)

    company = (meta or {}).get("company")
    camera  = (meta or {}).get("camera")

    cap = open_capture(src)
    if cap is None:
        return

    last_shot_ts = 0.0
    notice_until = 0.0
    notice_lines = []

    try:
        while True:
            ok, frame_bgr = cap.read()
            if not ok or frame_bgr is None or frame_bgr.size == 0:
                break
            if mirror:
                frame_bgr = cv2.flip(frame_bgr, 1)

            vis, dets = infer_one(frame_bgr)
            matched = [d for d in dets if d["class"] in TRIGGERS]

            now = time.time()
            if matched and (now - last_shot_ts) >= SNAPSHOT_COOLDOWN:
                last_shot_ts = now

                classes_str = "_".join(sorted({d["class"] for d in matched}))[:80]
                ts_ms = int(now * 1000)
                dt_iso = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

                cfg = _s3_cfg()
                safe_src = str(src).replace("/", "_")
                prefix = cfg["prefix"]
                if prefix and not prefix.endswith("/"):
                    prefix += "/"
                key = f"{prefix}{dt_iso}_{classes_str}_src-{safe_src}.jpg" if prefix else f"{dt_iso}_{classes_str}_src-{safe_src}.jpg"

                local_path = os.path.join(SNAPSHOT_DIR, f"{ts_ms}_{classes_str}.jpg")

                upload_info = _save_jpeg_to_s3(vis, key) if cfg["bucket"] else None
                if upload_info:
                    snap_ref = upload_info.get("url") or upload_info.get("s3_uri")
                else:
                    info = _save_jpeg_local(vis, local_path)
                    snap_ref = info.get("path")

                counts = Counter(d["class"] for d in dets if d["class"] in TRIGGERS)
                payload = {
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "src": str(src),
                    "company": company,
                    "camera": camera,
                    "snapshot": snap_ref,
                    "triggers": sorted(list({d["class"] for d in matched})),
                    "detections": dict(counts),
                    # [KAFKA] 추가 메타
                    "model": cfg.name,
                    "scoreThreshold": SCORE_THRESHOLD,
                }
                # [KAFKA] eventId 생성(멱등/중복제거용)
                base = f"{payload['ts']}|{company}|{camera}|{payload['src']}|{','.join(payload['triggers'])}"
                payload["eventId"] = hashlib.sha256(base.encode("utf-8")).hexdigest()[:16]

                logging.info(json.dumps(payload, ensure_ascii=False))

                # [KAFKA] 이벤트 발행 (company:camera 를 파티션 키로 → 순서 보장)
                if _kafka_ok:
                    key_part = f"{(company or '')}:{(camera or '')}".strip(":") or str(src)
                    try:
                        send_json(KAFKA_TOPIC_EVENTS, key=key_part, payload=payload)
                    except Exception as e:
                        logging.error(f"Kafka publish failed: {e}")

                short_ref = (snap_ref[:60] + "...") if isinstance(snap_ref, str) and len(snap_ref) > 64 else snap_ref
                lines = [
                    "⚠ Trigger detected",
                    f"Classes: {', '.join(payload['triggers'])}",
                ]
                if company: lines.append(f"Company: {company}")
                if camera:  lines.append(f"Camera: {camera}")
                if short_ref: lines.append(f"Snapshot: {short_ref}")
                notice_lines = lines
                notice_until = now + NOTICE_SECS

            if now < notice_until and notice_lines:
                vis = _draw_notice(vis, notice_lines)

            ok, buf = cv2.imencode(".jpg", vis)
            if not ok:
                continue
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n")
    finally:
        cap.release()

# ===== 멀티뷰 (그리드 합성) =====
def _resize_keep_ratio(img, target_h: int):
    if img is None or img.size == 0:
        return None
    h, w = img.shape[:2]
    if h <= 0 or w <= 0:
        return None
    scale = target_h / float(h)
    new_w = max(1, int(w * scale))
    return cv2.resize(img, (new_w, target_h))

def _make_grid(frames, cols: int, cell_h: int = 360):
    tiles = []
    for f in frames:
        r = _resize_keep_ratio(f, cell_h)
        if r is not None:
            tiles.append(r)
    if not tiles:
        return None

    rows = math.ceil(len(tiles) / cols)
    grid_rows = []
    idx = 0
    for _ in range(rows):
        row_tiles = tiles[idx: idx + cols]
        idx += cols
        if len(row_tiles) < cols:
            h = row_tiles[0].shape[0]
            pad = [np.zeros((h, 1, 3), dtype=row_tiles[0].dtype)] * (cols - len(row_tiles))
            row_tiles = row_tiles + pad
        row = cv2.hconcat(row_tiles)
        grid_rows.append(row)

    if len(grid_rows) == 1:
        return grid_rows[0]
    return cv2.vconcat(grid_rows)

def mjpeg_multi_generator(src_list, cols: int = 2, mirror: bool = True, cell_h: int = 360):
    init_model()

    caps = []
    for s in src_list:
        src = int(s) if isinstance(s, str) and s.isdigit() else s
        cap = open_capture(src)
        if cap is not None:
            caps.append(cap)

    if not caps:
        return

    try:
        while True:
            vis_list = []
            dead = []
            for i, cap in enumerate(caps):
                ok, f = cap.read()
                if not ok or f is None or f.size == 0:
                    dead.append(i)
                    vis_list.append(None)
                    continue
                if mirror:
                    f = cv2.flip(f, 1)

                vis, _ = infer_one(f)
                vis_list.append(vis)

            if dead:
                for i in sorted(dead, reverse=True):
                    try: caps[i].release()
                    except: pass
                    del caps[i]

            vis_list = [v for v in vis_list if v is not None]
            if not vis_list:
                break

            grid = _make_grid(vis_list, cols=cols, cell_h=cell_h)
            if grid is None:
                continue

            ok, buf = cv2.imencode(".jpg", grid)
            if not ok:
                continue

            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n")
    finally:
        for c in caps:
            try: c.release()
            except: pass
