import threading, queue, logging
from typing import Dict, Tuple, Set, Optional

from util.cctv_bound import detect_loop_streaming

# company+camera 별 프레임 버스
class FrameBus:
    def __init__(self):
        self.lock = threading.Lock()
        self.views: Set[queue.Queue] = set()

    def subscribe(self) -> queue.Queue:
        q = queue.Queue(maxsize=2)  # 최신 프레임 1~2장만 유지
        with self.lock:
            self.views.add(q)
        return q

    def unsubscribe(self, q: queue.Queue):
        with self.lock:
            self.views.discard(q)

    def publish(self, jpeg_bytes: bytes):
        with self.lock:
            sinks = list(self.views)
        if not sinks:
            return
        for q in sinks:
            try:
                # 최신만 남기기
                while True:
                    q.get_nowait()
            except Exception:
                pass
            try:
                q.put_nowait(jpeg_bytes)
            except Exception:
                pass

    def count(self) -> int:
        with self.lock:
            return len(self.views)

_buses: Dict[Tuple[str,str], FrameBus] = {}
_workers: Dict[Tuple[str,str], threading.Thread] = {}
_stops: Dict[Tuple[str,str], threading.Event] = {}

def _bus(company: str, camera: str) -> FrameBus:
    key = (company, camera)
    if key not in _buses:
        _buses[key] = FrameBus()
    return _buses[key]

def subscribe_view(company: str, camera: str) -> queue.Queue:
    return _bus(company, camera).subscribe()

def unsubscribe_view(company: str, camera: str, q: queue.Queue):
    _bus(company, camera).unsubscribe(q)

def viewer_count(company: str, camera: str) -> int:
    return _bus(company, camera).count()

def is_running(company: str, camera: str) -> bool:
    w = _workers.get((company, camera))
    return bool(w and w.is_alive())

def start_worker(company: str, camera: str, src, mirror: bool = True, push: bool = False) -> bool:
    key = (company, camera)
    if is_running(company, camera):
        return False

    stop_ev = threading.Event()
    _stops[key] = stop_ev
    bus = _bus(company, camera)

    def on_vis(jpeg_bytes: bytes):
        bus.publish(jpeg_bytes)

    def run():
        try:
            detect_loop_streaming(
                src, mirror=mirror, company=company, camera=camera,
                on_vis_jpeg=on_vis, stop_flag=stop_ev.is_set
            )
        except Exception as e:
            logging.exception(f"DetectWorker {company}:{camera} failed: {e}")
        finally:
            _workers.pop(key, None)
            _stops.pop(key, None)

    th = threading.Thread(
        target=run, name=f"DetectWorker-{company}:{camera}", daemon=True
    )
    _workers[key] = th
    th.start()
    return True

def stop_worker(company: str, camera: Optional[str] = None):
    if camera is None:
        for (c, cam), ev in list(_stops.items()):
            if c == company:
                ev.set()
    else:
        ev = _stops.get((company, camera))
        if ev:
            ev.set()

def list_running(company: Optional[str] = None):
    out = []
    for (c, cam), w in _workers.items():
        if company is None or company == c:
            out.append({
                "company": c,
                "camera": cam,
                "alive": w.is_alive(),
                "viewers": viewer_count(c, cam),
            })
    return out
