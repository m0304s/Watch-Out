import cv2, time, os

# FFmpeg 옵션: RTSP는 TCP로, stimeout=5초
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;5000000"

def try_open_capture(src, timeout_sec=5):
    # src가 숫자 문자열이면 int로
    if isinstance(src, str) and src.isdigit():
        src = int(src)

    # 로컬이면 CAP_DSHOW, RTSP/HTTP는 CAP_FFMPEG
    if isinstance(src, int):
        cap = cv2.VideoCapture(src, cv2.CAP_DSHOW)
    else:
        cap = cv2.VideoCapture(src, cv2.CAP_FFMPEG)

    if not cap.isOpened():
        return None, "open_failed"

    # 첫 프레임 읽기 시도
    t0 = time.time()
    while time.time() - t0 < timeout_sec:
        ok, frame = cap.read()
        if ok and frame is not None and frame.size > 0:
            return cap, "ok"
        time.sleep(0.1)

    cap.release()
    return None, "timeout"
