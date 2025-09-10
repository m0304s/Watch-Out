from fastapi import FastAPI, Form, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from util.cctv_bound import init_model, mjpeg_generator, open_capture
from util.capture_utils import try_open_capture
import asyncio
app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.on_event("startup")
def on_start():
    init_model()
    
@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

@app.post("/submit")
async def submit_form(name: str = Form(...)):
    # name을 영상 소스로 쓰고 싶다면 int/URL 판별
    src = 0
    try:
        src = int(name)
    except ValueError:
        src = name  # rtsp/http/file path

    cap = open_capture(src)
    if cap is None:
        # 503으로 명확히 응답
        raise HTTPException(status_code=503, detail="웹캠/영상 소스를 열 수 없습니다.")
    cap.release()
    return {"입력값": name, "status": "ok"}

@app.get("/video_feed")
async def video_feed(request: Request, src: str = Query(...)):
    # 1) 시작 전에 5초 안에 첫 프레임 확인 (흰 화면 방지)
    cap, status = try_open_capture(src, timeout_sec=5)
    if cap is None:
        raise HTTPException(status_code=503, detail=f"소스를 열 수 없음: {status}")
    cap.release()

    # 2) 클라이언트 끊김 감지 + 안전 release 보장
    async def gen():
        # mjpeg_generator는 동기 제너레이터라면 여기서 감싸서 cancel을 전파
        # (mjpeg_generator 내부에서 cap = open_capture(...) 하고 finally에서 release 하도록 구현되어 있어야 안전)
        it = mjpeg_generator(int(src) if src.isdigit() else src)
        try:
            while True:
                # 탭/네트워크 끊김 감지
                if await request.is_disconnected():
                    break
                try:
                    chunk = next(it)  # 동기 제너레이터면 next 사용
                except StopIteration:
                    break
                yield chunk
                # 이벤트 루프에 양보 (취소 신호 빨리 받도록)
                await asyncio.sleep(0)
        except asyncio.CancelledError:
            # 클라이언트 강제 종료 시 여기로 들어옴
            pass
        finally:
            # mjpeg_generator 쪽 finally에서 cap.release() 하도록 구현되어 있으면
            # 여기서 별도 처리 불필요. 혹시 모를 누수 방지를 위해 try/except.
            try:
                if hasattr(it, 'close'):
                    it.close()
            except Exception:
                pass

    return StreamingResponse(gen(), media_type="multipart/x-mixed-replace; boundary=frame")