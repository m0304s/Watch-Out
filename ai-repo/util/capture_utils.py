import os
import re
import cv2
import time
from urllib.parse import urlparse

# 기본 FFmpeg 옵션: RTSP는 TCP + 소켓 타임아웃
# 기존 설정을 유지하면서 RTSP 안정성에 도움 되는 옵션을 "추가"만 함.
_base_opts = "rtsp_transport;tcp|stimeout;5000000"
_extra_low_delay_opts = "max_delay;500000|reorder_queue_size;0|fpsprobesize;0|flags;low_delay|probesize;32768|analyzeduration;0"

def _merge_ffmpeg_opts():
    cur = os.environ.get("OPENCV_FFMPEG_CAPTURE_OPTIONS", "")
    parts = [p for p in cur.split("|") if p]
    # 이미 존재하는 키는 유지, 없으면 추가
    have = {p.split(";", 1)[0] for p in parts}
    for token in (_base_opts + "|" + _extra_low_delay_opts).split("|"):
        if not token:
            continue
        k = token.split(";", 1)[0]
        if k not in have:
            parts.append(token)
            have.add(k)
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "|".join(parts)

_merge_ffmpeg_opts()


def _is_int_cam(src):
    return isinstance(src, int) or (isinstance(src, str) and src.isdigit())


def _is_rtsp(src) -> bool:
    if _is_int_cam(src):
        return False
    try:
        u = urlparse(str(src))
        return (u.scheme or "").lower() == "rtsp"
    except Exception:
        return False


def _backend_for(src):
    if _is_int_cam(src):
        return cv2.CAP_DSHOW  # Windows에서는 DirectShow가 가장 안정적
    else:
        return cv2.CAP_FFMPEG  # 네트워크/파일은 FFmpeg


def try_open_capture(
    src,
    timeout_sec: int = 5,
    open_retries: int = 0,
    per_try_read_sec: int | None = None,
):
    """
    카메라/스트림 '미리' 열어보는 유효성 검사.
    - RTSP는 느릴 수 있으므로 기본 타임아웃/재시도를 더 길게 잡음.
    - 성공 시 (cap, "ok")
    - 실패 시 (None, reason) ; reason 예: "open_failed", "timeout_read", "timeout_rtsp"

    인자:
      - timeout_sec: 각 시도에서 첫 프레임을 기다리는 시간
      - open_retries: open/read 실패 시 재시도 횟수
      - per_try_read_sec: 시도별 read 대기 시간(미지정 시 timeout_sec 사용)
    """
    # RTSP면 디폴트 타임아웃/재시도 상향
    is_rtsp = _is_rtsp(src)
    if is_rtsp:
        timeout_sec = max(timeout_sec, int(os.getenv("RTSP_TRYOPEN_TIMEOUT", "15")))
        open_retries = max(open_retries, int(os.getenv("RTSP_TRYOPEN_RETRIES", "2")))
        if per_try_read_sec is None:
            per_try_read_sec = int(os.getenv("RTSP_TRYOPEN_PERTRY_READ", "7"))
    else:
        if per_try_read_sec is None:
            per_try_read_sec = timeout_sec

    # src 형 변환
    if isinstance(src, str) and src.isdigit():
        src = int(src)

    backend = _backend_for(src)

    last_reason = "open_failed"
    for attempt in range(open_retries + 1):
        cap = cv2.VideoCapture(src, backend)
        if not cap.isOpened():
            last_reason = "open_failed"
            # 잠깐 쉬고 재시도
            time.sleep(0.3)
            continue

        # 버퍼 최소화(저지연)
        try:
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass

        # 첫 프레임까지 조금 더 기다리며 여러 번 read 시도
        t0 = time.time()
        while time.time() - t0 < per_try_read_sec:
            ok, frame = cap.read()
            if ok and frame is not None and frame.size > 0:
                return cap, "ok"
            time.sleep(0.1)

        # 이 시도에서 읽기 타임아웃
        cap.release()
        last_reason = "timeout_rtsp" if is_rtsp else "timeout_read"
        # 재시도 전 짧게 대기
        time.sleep(0.4)

    return None, last_reason
