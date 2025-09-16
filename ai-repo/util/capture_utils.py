# util/capture_utils.py
import cv2

def try_open_capture(src, timeout_sec=5):
    try:
        if isinstance(src, str) and src.isdigit():
            cap = cv2.VideoCapture(int(src), cv2.CAP_DSHOW)
        else:
            cap = cv2.VideoCapture(src)
        if not cap.isOpened():
            return None, "open-failed"
        # 한 프레임만 읽어봄
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        ok, _ = cap.read()
        if not ok:
            cap.release()
            return None, "read-failed"
        return cap, "ok"
    except Exception as e:
        return None, f"exception:{e}"
