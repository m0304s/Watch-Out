# main.py
from dotenv import load_dotenv
load_dotenv()

import os
import asyncio
from typing import List, Optional

from fastapi import FastAPI, Form, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates

# --- cctv_bound 가져오기 (없는 심볼은 None으로 방어) ---
try:
    from util.cctv_bound import (
        init_model,
        mjpeg_generator,         # (테스트/호환) 보기+추론 원샷 제너레이터
        mjpeg_multi_generator,   # 서버 합성 멀티뷰(그리드)
        mjpeg_raw_generator,     # 보기 전용 RAW (현재 규칙상 기본 미사용)
    )
except Exception:
    from util.cctv_bound import init_model
    mjpeg_generator = None
    mjpeg_multi_generator = None
    mjpeg_raw_generator = None

from util.capture_utils import try_open_capture
from util.kafka_control_consumer import start_control_consumer

from util.stream_workers import (
    list_running, start_worker, stop_worker, is_running,
    subscribe_view, unsubscribe_view, viewer_count,
)

app = FastAPI()
templates = Jinja2Templates(directory="templates")


# ===================== 라이프사이클 =====================

@app.on_event("startup")
def on_start():
    init_model()
    try:
        start_control_consumer()
    except Exception:
        # 외부 컨트롤/Kafka가 없을 경우에도 서버는 계속 떠야 함
        pass


# ===================== 상태 조회 =====================

@app.get("/running")
async def running(company: str | None = None):
    """
    현재 워커(추론) 상태 및 뷰어 수 확인
    """
    return {"items": list_running(company)}


# ===================== 추론 제어 (워커) =====================

@app.post("/detect/start")
async def detect_start(
    company: str = Query(...),
    camera: str  = Query(...),
    src: str     = Query(..., description="숫자 또는 rtsp/http URL"),
    mirror: bool = Query(True),
    push: bool   = Query(False, description="게이트웨이/스프링 푸시 사용 여부"),
):
    """
    추론(워커) 시작.
    - RTSP는 초기 연결 지연이 있을 수 있으므로 try_open_capture를 관대하게.
    - 실패해도 ALLOW_RTSP_LATE_START=1이면 워커를 먼저 띄워 백그라운드 재연결 허용.
    """
    allow_late = os.getenv("ALLOW_RTSP_LATE_START", "1").lower() in ("1", "true", "yes")

    cap, status = try_open_capture(
        src,
        timeout_sec=15,       # RTSP일 때 내부에서 자동 상향/재시도 적용
        open_retries=2,
        per_try_read_sec=None
    )

    if cap is not None:
        cap.release()
        ok = start_worker(company, camera, int(src) if src.isdigit() else src, mirror=mirror, push=push)
        return {"started": ok, "probe": "ok", "running": is_running(company, camera)}
    else:
        if allow_late and str(src).lower().startswith("rtsp://"):
            ok = start_worker(company, camera, int(src) if src.isdigit() else src, mirror=mirror, push=push)
            return {
                "started": ok,
                "probe": status,
                "running": is_running(company, camera),
                "note": "RTSP 초기 지연으로 프루브 실패. 워커가 백그라운드에서 재시도합니다."
            }
        raise HTTPException(status_code=503, detail=f"소스를 열 수 없음: {status}")


@app.post("/detect/stop")
async def detect_stop(company: str = Query(...), camera: str = Query(...)):
    """
    추론(워커) 정지.
    - 규칙: 활성 뷰어가 남아 있으면 정지 불가(409)
    """
    vc = viewer_count(company, camera)
    if vc > 0:
        raise HTTPException(
            status_code=409,
            detail=f"먼저 카메라 보기를 모두 종료하세요. 현재 활성 뷰어 {vc}명."
        )
    stop_worker(company, camera)
    return {"running": False}


# ===================== 기본 폼/페이지 =====================

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})


@app.get("/multiview", response_class=HTMLResponse)
async def multiview_page(request: Request):
    """
    멀티뷰 프론트 페이지
    """
    return templates.TemplateResponse("multi.html", {"request": request})


@app.post("/submit")
async def submit_form(name: str = Form(...)):
    """
    폼에서 입력한 src 간단 검증
    """
    try:
        src = int(name)
    except ValueError:
        src = name

    cap, status = try_open_capture(src, timeout_sec=10, open_retries=1)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"웹캠/영상 소스를 열 수 없습니다: {status}")
    cap.release()
    return {"입력값": name, "status": "ok"}


# ===================== 보기(스트리밍) =====================

@app.get("/cctv")
async def cctv_stream(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url (검증·로그용)"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None),
    camera: Optional[str]  = Query(None),
):
    """
    보기 시작: 워커(추론)가 켜져 있어야만 허용.
    워커가 발행하는 JPEG 스트림을 구독해서 그대로 내보낸다.
    """
    if not company or not camera:
        raise HTTPException(status_code=400, detail="company, camera 파라미터가 필요합니다.")

    if not is_running(company, camera):
        raise HTTPException(status_code=409, detail="추론(워커)이 켜져 있지 않습니다. 먼저 /detect/start 로 시작하세요.")

    q = subscribe_view(company, camera)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    jpeg_bytes = q.get(timeout=2.0)
                except Exception:
                    continue
                # 워커가 이미 바운딩박스/오버레이 적용한 JPEG을 주므로 그대로 전달
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg_bytes + b"\r\n")
                await asyncio.sleep(0)
        finally:
            unsubscribe_view(company, camera, q)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/video_feed")
async def video_feed(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None),
    camera: Optional[str]  = Query(None),
):
    """
    (테스트/호환) 보기 엔드포인트.
    운영 혼란 방지를 위해 /cctv와 동일한 규칙 적용: 워커가 켜져 있어야만 허용.
    """
    if not company or not camera:
        raise HTTPException(status_code=400, detail="company, camera 파라미터가 필요합니다.")
    if not is_running(company, camera):
        raise HTTPException(status_code=409, detail="추론(워커)이 켜져 있지 않습니다. 먼저 /detect/start 로 시작하세요.")

    q = subscribe_view(company, camera)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    jpeg_bytes = q.get(timeout=2.0)
                except Exception:
                    continue
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg_bytes + b"\r\n")
                await asyncio.sleep(0)
        finally:
            unsubscribe_view(company, camera, q)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")


# ===================== 서버 합성 멀티뷰 (옵션) =====================

@app.get("/multi_stream")
async def multi_stream(
    request: Request,
    src: List[str] = Query(..., description="반복 파라미터: /multi_stream?src=0&src=1&src=rtsp://..."),
    cols: int = Query(2, ge=1, le=6),
    mirror: bool = True,
    cell_h: int = 360
):
    """
    원래 있던 서버 측 합성 그리드 스트림 유지.
    util.cctv_bound에 mjpeg_multi_generator가 없으면 501 반환.
    """
    if mjpeg_multi_generator is None:
        raise HTTPException(status_code=501, detail="mjpeg_multi_generator 미구현")

    def sync_gen():
        it = mjpeg_multi_generator(src_list=src, cols=cols, mirror=mirror, cell_h=cell_h)
        try:
            for chunk in it:
                yield chunk
        finally:
            try:
                if hasattr(it, "close"):
                    it.close()
            except:
                pass

    return StreamingResponse(sync_gen(), media_type="multipart/x-mixed-replace; boundary=frame")
