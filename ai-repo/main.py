from dotenv import load_dotenv
load_dotenv()

from typing import List, Optional
from fastapi import FastAPI, Form, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
import asyncio

from util.cctv_bound import (
    init_model,
    mjpeg_generator,         # (테스트/호환) 보기+추론 원샷 제너레이터
    mjpeg_multi_generator,   # 서버 합성 멀티뷰(그리드)
    mjpeg_raw_generator,     # 보기 전용 RAW (현재 규칙상 fallback 금지지만 남겨둠)
)
from util.capture_utils import try_open_capture
from util.kafka_control_consumer import start_control_consumer
from util.stream_workers import (
    list_running, start_worker, stop_worker, is_running,
    subscribe_view, unsubscribe_view, viewer_count,
)

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
def on_start():
    init_model()
    try:
        start_control_consumer()
    except Exception:
        pass

@app.get("/running")
async def running(company: str | None = None):
    return {"items": list_running(company)}

# === 추론 제어 API (워커) ===
@app.post("/detect/start")
async def detect_start(
    company: str = Query(...),
    camera: str  = Query(...),
    src: str     = Query(..., description="숫자 또는 rtsp/http URL"),
    mirror: bool = Query(True),
    push: bool   = Query(False, description="스프링/게이트웨이 푸시 사용 여부"),
):
    cap, status = try_open_capture(src, timeout_sec=5)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"소스를 열 수 없음: {status}")
    cap.release()

    ok = start_worker(company, camera, int(src) if src.isdigit() else src, mirror=mirror, push=push)
    return {"started": ok, "running": is_running(company, camera)}

@app.post("/detect/stop")
async def detect_stop(company: str = Query(...), camera: str = Query(...)):
    # 규칙 2: 뷰어가 남아 있으면 추론 정지 불가
    vc = viewer_count(company, camera)
    if vc > 0:
        raise HTTPException(
            status_code=409,
            detail=f"먼저 카메라 보기를 모두 종료하세요. 현재 활성 뷰어 {vc}명."
        )
    stop_worker(company, camera)
    return {"running": False}

# === 기본 폼 페이지(옵션) ===
@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

@app.post("/submit")
async def submit_form(name: str = Form(...)):
    try:
        src = int(name)
    except ValueError:
        src = name
    cap, status = try_open_capture(src, timeout_sec=5)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"웹캠/영상 소스를 열 수 없습니다: {status}")
    cap.release()
    return {"입력값": name, "status": "ok"}

# === 멀티뷰 테스트 페이지 ===
@app.get("/multiview", response_class=HTMLResponse)
async def multiview_page(request: Request):
    return templates.TemplateResponse("multi.html", {"request": request})

# === 단일 소스 보기: 워커가 있어야만 허용 (규칙 1) ===
@app.get("/cctv")
async def cctv_stream(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url (검증용)"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None),
    camera: Optional[str]  = Query(None),
):
    if not company or not camera:
        raise HTTPException(status_code=400, detail="company, camera 파라미터가 필요합니다.")

    # 규칙 1: 반드시 워커가 켜져 있어야 보기 시작 가능
    if not is_running(company, camera):
        raise HTTPException(status_code=409, detail="추론(워커)이 켜져 있지 않습니다. 먼저 /detect/start 로 시작하세요.")

    # 워커 프레임 구독
    q = subscribe_view(company, camera)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    chunk = q.get(timeout=2.0)  # 워커가 뿌리는 최신 JPEG
                except Exception:
                    continue
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + chunk + b"\r\n")
                await asyncio.sleep(0)
        finally:
            unsubscribe_view(company, camera, q)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# === (테스트/호환) 보기+추론 원샷 (규칙 1 적용: 워커 강제는 아니지만 기본적으로 차단) ===
@app.get("/video_feed")
async def video_feed(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None),
    camera: Optional[str]  = Query(None),
):
    # 개발·진단용 엔드포인트지만, 운영중 혼선 방지를 위해 동일 규칙 적용
    if not company or not camera:
        raise HTTPException(status_code=400, detail="company, camera 파라미터가 필요합니다.")
    if not is_running(company, camera):
        raise HTTPException(status_code=409, detail="추론(워커)이 켜져 있지 않습니다. 먼저 /detect/start 로 시작하세요.")

    # 워커 출력만 보게 하려면 /cctv 쓰는게 맞지만, 호환 유지
    q = subscribe_view(company, camera)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    chunk = q.get(timeout=2.0)
                except Exception:
                    continue
                yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + chunk + b"\r\n")
                await asyncio.sleep(0)
        finally:
            unsubscribe_view(company, camera, q)

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# === 서버 합성 멀티뷰 (그리드) ===
@app.get("/multi_stream")
async def multi_stream(
    request: Request,
    src: List[str] = Query(..., description="반복 파라미터: /multi_stream?src=0&src=1&src=rtsp://..."),
    cols: int = Query(2, ge=1, le=6),
    mirror: bool = True,
    cell_h: int = 360
):
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
