import os
import sys
import csv
import math
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import numpy as np

try:
    from tqdm import tqdm
except ImportError:
    def tqdm(x, **kwargs):
        return x

# -----------------------------------------------------------------------------
# 프로젝트 임베딩 서비스 로드
# -----------------------------------------------------------------------------
try:
    from app.services.face_embedding import face_embedding_service
    _HAS_PROJECT = True
except Exception as e:
    _HAS_PROJECT = False
    _IMPORT_ERR = e

# -----------------------------------------------------------------------------
# 로깅 설정
# -----------------------------------------------------------------------------
logger = logging.getLogger("evaluate_lfw_mem_vec_roc")
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
logger.addHandler(handler)
logger.setLevel(logging.INFO)

@dataclass
class EvalConfig:
    lfw_dir: str = "./lfw-people"
    results_csv: str = "logs/evaluation_results.csv"
    metric: str = "cosine"
    threshold_min: float = 0.2
    threshold_max: float = 0.8
    threshold_steps: int = 200
    negative_from_singletons: bool = True
    batch_size: int = 256

# (이 아래부터는 수정할 필요 없는 함수들입니다)
# -----------------------------------------------------------------------------

def ensure_dirs(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)

def list_person_images(person_dir: str) -> List[str]:
    return sorted([f for f in os.listdir(person_dir)
                   if f.lower().endswith((".jpg", ".jpeg", ".png"))])

def read_bytes(path: str) -> Optional[bytes]:
    try:
        with open(path, "rb") as f:
            return f.read()
    except Exception as e:
        logger.debug("이미지 로드 실패: %s (%s)", path, e)
        return None

def generate_embedding(image_bytes: bytes) -> Optional[np.ndarray]:
    if not _HAS_PROJECT:
        logger.error("app.services.face_embedding 임포트 실패: %s", _IMPORT_ERR)
        sys.exit(1)
    try:
        vec = face_embedding_service.generate_embedding(image_bytes)
        return np.asarray(vec, dtype=np.float32) if vec is not None else None
    except Exception as e:
        logger.debug("임베딩 실패: %s", e)
        return None

def register_from_lfw(lfw_dir: str) -> Tuple[List[str], List[str], np.ndarray, Dict[str, List[str]]]:
    uids, names, vecs, registered = [], [], [], {}
    persons = sorted([p for p in os.listdir(lfw_dir) if os.path.isdir(os.path.join(lfw_dir, p))])
    for person in tqdm(persons, desc="등록"):
        pdir = os.path.join(lfw_dir, person)
        images = list_person_images(pdir)
        if images:
            img_bytes = read_bytes(os.path.join(pdir, images[0]))
            if img_bytes:
                vec = generate_embedding(img_bytes)
                if vec is not None:
                    uids.append(f"lfw::{person}")
                    names.append(person)
                    vecs.append(vec)
                    registered[person] = images[1:]
    if not vecs:
        raise RuntimeError("등록된 임베딩이 없습니다.")
    emb_matrix = np.vstack(vecs).astype(np.float32)
    logger.info("등록 완료: %d명, emb_matrix=%s", len(uids), emb_matrix.shape)
    return uids, names, emb_matrix, registered

def normalize_rows(mat: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    return mat / (np.linalg.norm(mat, axis=1, keepdims=True) + eps)

def nearest_by_l2_batch(Q: np.ndarray, B: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    Q2 = np.sum(Q*Q, axis=1, keepdims=True)
    B2 = np.sum(B*B, axis=1, keepdims=True).T
    d2 = Q2 + B2 - 2.0 * (Q @ B.T)
    idx = np.argmin(d2, axis=1)
    return idx, np.sqrt(np.maximum(0.0, d2[np.arange(len(Q)), idx]))

def nearest_by_cosine_batch(Q: np.ndarray, B: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    sims = Q @ B.T
    idx = np.argmax(sims, axis=1)
    return idx, 1.0 - sims[np.arange(len(Q)), idx]

def collect_distances(cfg: EvalConfig, names: List[str], emb_matrix: np.ndarray, registered: Dict[str, List[str]]) -> Tuple[List[float], List[float]]:
    metric = cfg.metric.lower()
    emb_base = normalize_rows(emb_matrix) if metric == "cosine" else emb_matrix

    def get_dists(vec_list):
        if not vec_list: return []
        logger.info("%d개 샘플에 대한 거리 계산 중...", len(vec_list))
        Q = np.vstack(vec_list).astype(np.float32)
        if metric == "cosine":
            Q = normalize_rows(Q)
            _, dists = nearest_by_cosine_batch(Q, emb_base)
        else:
            _, dists = nearest_by_l2_batch(Q, emb_base)
        return [float(d) for d in dists]

    positive_pairs = [(p, i) for p, imgs in registered.items() for i in imgs]
    q_vecs_pos = [v for p, i in tqdm(positive_pairs, desc="양성 샘플 처리") if (b := read_bytes(os.path.join(cfg.lfw_dir, p, i))) and (v := generate_embedding(b)) is not None]

    q_vecs_neg = []
    if cfg.negative_from_singletons:
        persons = sorted([p for p in os.listdir(cfg.lfw_dir) if os.path.isdir(os.path.join(cfg.lfw_dir, p))])
        for person in tqdm(persons, desc="음성 샘플 스캔"):
            images = list_person_images(os.path.join(cfg.lfw_dir, person))
            if len(images) == 1:
                if (b := read_bytes(os.path.join(cfg.lfw_dir, person, images[0]))) and (v := generate_embedding(b)) is not None:
                    q_vecs_neg.append(v)

    return get_dists(q_vecs_pos), get_dists(q_vecs_neg)

def grid_search_threshold(distances_pos: List[float], distances_neg: List[float], cfg: EvalConfig) -> Tuple[float, float, float]:
    if not distances_pos and not distances_neg:
        return cfg.threshold_min, 0.0, 0.0
    best_thr, best_acc, best_hmean = cfg.threshold_min, -1.0, -1.0
    pos_arr, neg_arr = np.asarray(distances_pos), np.asarray(distances_neg)
    for thr in np.linspace(cfg.threshold_min, cfg.threshold_max, cfg.threshold_steps):
        tpr = float((pos_arr <= thr).mean()) if pos_arr.size else 0.0
        tnr = float((neg_arr > thr).mean()) if neg_arr.size else 0.0
        acc = (tpr * pos_arr.size + tnr * neg_arr.size) / max(1, (pos_arr.size + neg_arr.size))
        hmean = (2 * tpr * tnr / (tpr + tnr)) if (tpr + tnr) > 0 else 0.0
        if acc > best_acc or (math.isclose(acc, best_acc) and hmean > best_hmean):
            best_acc, best_thr, best_hmean = acc, thr, hmean
    return float(best_thr), float(best_acc * 100.0), float(best_hmean * 100.0)

def compute_roc_auc(pos_dists: List[float], neg_dists: List[float]) -> Tuple[np.ndarray, np.ndarray, float]:
    if not pos_dists and not neg_dists:
        return np.array([0.0, 1.0]), np.array([0.0, 1.0]), 0.5
    labels = np.concatenate([np.ones(len(pos_dists)), np.zeros(len(neg_dists))])
    scores = np.concatenate([-np.asarray(pos_dists), -np.asarray(neg_dists)])
    order = np.argsort(scores)[::-1]
    labels_sorted = labels[order]
    P, N = float(len(pos_dists)), float(len(neg_dists))
    if P == 0 or N == 0: return np.array([0.0, 1.0]), np.array([0.0, 1.0]), 0.5
    tpr_list, fpr_list = [0.0], [0.0]
    tp, fp = 0.0, 0.0
    for y in labels_sorted:
        if y == 1: tp += 1.0
        else: fp += 1.0
        tpr_list.append(tp / P)
        fpr_list.append(fp / N)
    fpr, tpr = np.asarray(fpr_list), np.asarray(tpr_list)
    return fpr, tpr, float(np.trapz(tpr, fpr))

def tar_at_far(fpr: np.ndarray, tpr: np.ndarray, target_far: float) -> float:
    if fpr.size == 0 or tpr.size == 0: return 0.0
    idx = np.searchsorted(fpr, target_far, side="right")
    if idx == 0: return float(tpr[0])
    if idx >= len(fpr): return float(tpr[-1])
    x0, x1 = fpr[idx-1], fpr[idx]
    y0, y1 = tpr[idx-1], tpr[idx]
    return float(y0 + (y1 - y0) * (target_far - x0) / (x1 - x0)) if x1 > x0 else float(y0)

def evaluate(cfg: EvalConfig) -> Optional[Dict[str, object]]:
    if not os.path.isdir(cfg.lfw_dir):
        logger.error("LFW 경로가 없습니다: %s", cfg.lfw_dir)
        return None
    _, names, emb_matrix, registered = register_from_lfw(cfg.lfw_dir)
    pos_dists, neg_dists = collect_distances(cfg, names, emb_matrix, registered)
    best_thr, best_acc, best_hmean = grid_search_threshold(pos_dists, neg_dists, cfg)
    tpr = np.mean(np.asarray(pos_dists) <= best_thr) * 100.0 if pos_dists else 0.0
    tnr = np.mean(np.asarray(neg_dists) > best_thr) * 100.0 if neg_dists else 0.0
    fpr, tpr_curve, auc = compute_roc_auc(pos_dists, neg_dists)
    tar_far_1e3 = tar_at_far(fpr, tpr_curve, 1e-3) * 100.0
    tar_far_1e4 = tar_at_far(fpr, tpr_curve, 1e-4) * 100.0
    return {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "metric": cfg.metric.lower(),
        "n_registered": len(names),
        "n_pos_pairs": len(pos_dists),
        "n_neg_pairs": len(neg_dists),
        "best_threshold": round(best_thr, 6),
        "accuracy_at_best": round(best_acc, 4),
        "tpr_at_best": round(tpr, 4),
        "tnr_at_best": round(tnr, 4),
        "tpr_tnr_hmean_at_best": round(best_hmean, 4),
        "roc_auc": round(auc, 6),
        "tar@far=1e-3(%)": round(tar_far_1e3, 4),
        "tar@far=1e-4(%)": round(tar_far_1e4, 4),
    }

def append_csv(path: str, row: Dict[str, object]) -> None:
    ensure_dirs(path)
    exists = os.path.isfile(path)
    with open(path, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(row.keys()))
        if not exists: w.writeheader()
        w.writerow(row)

if __name__ == "__main__":
    config = EvalConfig()
    logger.info("평가 시작: lfw_dir=%s, metric=%s", config.lfw_dir, config.metric)
    results = evaluate(config)
    if results:
        logger.info("평가 결과: %s", results)
        append_csv(config.results_csv, results)
        logger.info("CSV 저장 완료: %s", config.results_csv)
    else:
        logger.error("평가 실패")
        sys.exit(1)
