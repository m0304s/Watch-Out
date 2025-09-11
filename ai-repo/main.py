# main.py
from dotenv import load_dotenv
load_dotenv()

from typing import List, Optional
from fastapi import FastAPI, Form, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from util.cctv_bound import init_model, mjpeg_generator, open_capture, mjpeg_multi_generator
from util.capture_utils import try_open_capture
import asyncio

from util.kafka_control_consumer import start_control_consumer
from util.stream_workers import list_running

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
def on_start():
    init_model()
    start_control_consumer()

@app.get("/running")
async def running(company: str | None = None):
    return {"items": list_running(company)}

# 기본 폼 페이지(옵션)
@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

@app.post("/submit")
async def submit_form(name: str = Form(...)):
    try:
        src = int(name)
    except ValueError:
        src = name
    cap = open_capture(src)
    if cap is None:
        raise HTTPException(status_code=503, detail="웹캠/영상 소스를 열 수 없습니다.")
    cap.release()
    return {"입력값": name, "status": "ok"}

# 단일 소스 스트림 (직접 보기용)
@app.get("/video_feed")
async def video_feed(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None, description="회사명(옵션)"),
    camera: Optional[str]  = Query(None, description="카메라명(옵션)"),
):
    """
    /video_feed?src=0&mirror=true&company=현대건설&camera=정문CCTV
    """
    cap, status = try_open_capture(src, timeout_sec=5)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"소스를 열 수 없음: {status}")
    cap.release()

    async def gen():
        it = mjpeg_generator(int(src) if src.isdigit() else src, mirror=mirror, meta={"company": company, "camera": camera})
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    chunk = next(it)
                except StopIteration:
                    break
                yield chunk
                await asyncio.sleep(0)
        except asyncio.CancelledError:
            pass
        finally:
            try:
                if hasattr(it, 'close'):
                    it.close()
            except:
                pass

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# 멀티뷰 테스트 페이지(템플릿)
@app.get("/multiview", response_class=HTMLResponse)
async def multiview_page(request: Request):
    return templates.TemplateResponse("multi.html", {"request": request})

# 단일 소스 전처리 스트림 (/multiview에서 <img>로 사용)
@app.get("/cctv")
async def cctv_stream(
    request: Request,
    src: str = Query(..., description="숫자 인덱스(0,1,2...) 또는 rtsp/http url"),
    mirror: bool = Query(True),
    company: Optional[str] = Query(None, description="회사명(옵션)"),
    camera: Optional[str]  = Query(None, description="카메라명(옵션)"),
):
    """
    프론트에서 /cctv?src=...&mirror=...&company=...&camera=... 로 호출
    -> 트리거 발생 시 백엔드 로그/웹훅 payload에 company/camera 포함
    """
    cap, status = try_open_capture(src, timeout_sec=5)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"소스를 열 수 없음: {status}")
    cap.release()

    async def gen():
        it = mjpeg_generator(int(src) if src.isdigit() else src, mirror=mirror, meta={"company": company, "camera": camera})
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    chunk = next(it)
                except StopIteration:
                    break
                yield chunk
                await asyncio.sleep(0)
        except asyncio.CancelledError:
            pass
        finally:
            try:
                if hasattr(it, "close"):
                    it.close()
            except:
                pass

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")

# 서버에서 합쳐 단일 스트림으로 제공(옵션)
@app.get("/multi_stream")
async def multi_stream(
    request: Request,
    src: List[str] = Query(..., description="반복 파라미터: /multi_stream?src=0&src=1&src=rtsp://..."),
    cols: int = Query(2, ge=1, le=6),
    mirror: bool = True,
    cell_h: int = 360
):
    """
    멀티 스트림은 현재 company/camera 메타를 단일 그리드에 섞기 애매해서 제외.
    필요하면 확장: /multi_stream_meta?src=...&company=...&camera=... 를 배열로 받는 방식으로 별도 구현 권장.
    """
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
