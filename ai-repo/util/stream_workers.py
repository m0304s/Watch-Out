import threading, logging
from typing import Dict, Tuple
from util.cctv_bound import mjpeg_generator

_workers: Dict[Tuple[str,str], "StreamWorker"] = {}

class StreamWorker(threading.Thread):
    def __init__(self, company: str, camera: str, src, mirror=True):
        super().__init__(daemon=True)
        self.company = company
        self.camera = camera
        self.src = src
        self.mirror = mirror
        self._stop = threading.Event()

    def stop(self): self._stop.set()

    def run(self):
        try:
            gen = mjpeg_generator(self.src, mirror=self.mirror, meta={"company": self.company, "camera": self.camera})
            for _ in gen:
                if self._stop.is_set():
                    break
        except Exception as e:
            logging.exception(f"Worker {self.company}:{self.camera} failed: {e}")

def start_worker(company: str, camera: str, src, mirror=True):
    key = (company, camera)
    if key in _workers and _workers[key].is_alive():
        return False
    w = StreamWorker(company, camera, src, mirror)
    _workers[key] = w
    w.start()
    return True

def stop_worker(company: str, camera: str | None = None):
    if camera is None:
        for (c, cam), w in list(_workers.items()):
            if c == company:
                w.stop()
                _workers.pop((c, cam), None)
        return
    key = (company, camera)
    w = _workers.pop(key, None)
    if w: w.stop()

def list_running(company: str | None = None):
    out = []
    for (c, cam), w in _workers.items():
        if company is None or company == c:
            out.append({"company": c, "camera": cam, "src": w.src, "mirror": w.mirror, "alive": w.is_alive()})
    return out
