import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

# --- 로깅 설정 ---
# 다른 모듈보다 먼저 설정하여 일관된 로깅 포맷을 유지합니다.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
      logging.StreamHandler(),
      logging.FileHandler('face_recognition.log', encoding='utf-8')
    ]
)


# --- 모듈 임포트 ---
# 라우터, 서비스, 설정 등을 가져옵니다.
from app.routes import faces_register
from app.services.face_embedding import face_embedding_service
from app.services.cctv_monitor import start_monitoring, stop_monitoring
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
  """
  FastAPI 애플리케이션의 시작과 종료 시점에 실행될 로직을 관리합니다.
  """
  # --- 애플리케이션 시작 시 ---
  logging.info("🚀 애플리케이션 시작 프로세스를 진행합니다...")

  # 1. AI 모델을 미리 로드하고, ArcFace(ONNX) 모델이 정상적으로 로드되었는지 확인합니다.
  try:
    # ArcFace(ONNX) 모델 로드의 핵심 객체인 'ort_session'이 있는지 확인
    if not hasattr(face_embedding_service, 'ort_session'):
      raise RuntimeError("ONNX 런타임 세션(ort_session)이 로드되지 않았습니다.")
    logging.info("✅ AI 모델(ArcFace ONNX)이 성공적으로 로드되었습니다.")
  except Exception as e:
    logging.critical(f"❌ AI 모델 로드에 실패하여 서버를 시작할 수 없습니다: {e}")
    # 실제 운영 환경에서는 여기서 프로세스를 종료시키는 것이 좋습니다.
    raise e

  # 2. CCTV 모니터링 백그라운드 작업을 시작합니다.
  logging.info("📹 CCTV 모니터링 백그라운드 작업을 시작합니다.")
  start_monitoring()

  yield # 이 시점에서 애플리케이션이 실행됩니다.

  # --- 애플리케이션 종료 시 (Ctrl+C 등) ---
  logging.info("🌙 애플리케이션 종료 프로세스를 진행합니다...")

  # 1. 백그라운드 스레드를 안전하게 종료합니다.
  stop_monitoring()
  logging.info("✅ 모든 백그라운드 스레드가 정리되었습니다.")


# --- FastAPI 앱 생성 ---
app = FastAPI(
    title="AI Face Recognition API",
    description="얼굴 등록 및 CCTV 실시간 인식을 처리하는 API",
    version="1.0.0",
    lifespan=lifespan # 시작/종료 이벤트를 관리하는 lifespan 등록
)


# --- API 엔드포인트 ---

@app.get("/health", summary="서버 상태 확인 (헬스체크)", tags=["Default"])
async def health_check():
  """
  서버가 정상적으로 실행 중인지 간단히 확인하는 엔드포인트입니다.
  로드 밸런서 등에서 사용될 수 있습니다.
  """
  return {"status": "ok", "message": "API server is running."}


@app.get("/monitoring/status", summary="실시간 모니터링 상태 확인", tags=["Monitoring"])
async def get_monitoring_status():
  """
  현재 CCTV 모니터링 상태와 주요 설정을 확인합니다.
  """
  # 순환 참조를 피하기 위해 함수 내에서 import
  from app.services.cctv_monitor import running_camera_threads, known_embeddings

  return {
    "monitoring_active": len(running_camera_threads) > 0,
    "active_cameras_count": len(running_camera_threads),
    "registered_faces_count": len(known_embeddings),
    "bbox_settings": {
      "filter_enabled": settings.ENABLE_BBOX_SIZE_FILTER,
      "min_width": settings.MIN_FACE_WIDTH,
      "min_height": settings.MIN_FACE_HEIGHT,
      "min_area": settings.MIN_FACE_AREA,
    },
    "recognition_settings": {
      "threshold": settings.RECOGNITION_THRESHOLD,
      "detection_confidence": settings.DETECTION_CONFIDENCE,
      "frame_interval_seconds": settings.FRAME_PROCESSING_INTERVAL_SECONDS
    }
  }


# --- API 라우터 포함 ---
# 다른 파일에 정의된 API 경로들을 메인 앱에 연결합니다.
app.include_router(
    faces_register.router,
    prefix="/api/v1", # 모든 관련 경로 앞에 /api/v1이 붙습니다.
    tags=["Face Registration"]
)

# uvicorn으로 이 파일을 실행하면 서버가 시작됩니다.
# 예: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload