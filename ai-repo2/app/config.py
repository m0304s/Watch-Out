from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Tuple
import os

# .env 파일 및 프로젝트 기본 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE_PATH = os.path.join(BASE_DIR, '.env')


class Settings(BaseSettings):
  # Database
  DB_NAME: str
  DB_USER: str
  DB_PASSWORD: str
  DB_HOST: str = "localhost"
  DB_PORT: int = 5432

  # Redis
  REDIS_HOST: str = "localhost"
  REDIS_PORT: int = 6379
  REDIS_DB: int = 0

  # AWS / S3
  S3_BUCKET: str
  AWS_ACCESS_KEY_ID: str | None = None
  AWS_SECRET_ACCESS_KEY: str | None = None
  AWS_REGION: str = "ap-northeast-2"
  S3_PRESIGN: int
  S3_PRESIGN_EX: int
  S3_PREFIX: str

  # Kafka
  KAFKA_BOOTSTRAP: str
  KAFKA_TOPIC_EVENTS: str
  KAFKA_TOPIC_CONTROL: str
  KAFKA_CLIENT_ID: str

  # Models
  MODEL_PATH: str = os.path.join(BASE_DIR, "models/MobileFaceNet.pb")
  PROTOTXT_PATH: str = os.path.join(BASE_DIR, "models/deploy.prototxt")
  CAFFE_MODEL_PATH: str = os.path.join(BASE_DIR, "models/res10_300x300_ssd_iter_140000.caffemodel")

  # General Settings (근거리 카메라 최적화)
  RECOGNITION_THRESHOLD: float = Field(default=0.8, description="인식 임계값 - 근거리용으로 낮춤")
  DETECTION_CONFIDENCE: float = Field(default=0.8, description="탐지 신뢰도 - 근거리용으로 높임")
  INPUT_SIZE: Tuple[int, int] = (112, 112)
  LOG_COOLDOWN_SECONDS: int = Field(default=15, description="중복 로그 방지 시간 - 근거리용으로 단축")
  FRAME_PROCESSING_INTERVAL_SECONDS: float = Field(default=0.5, description="프레임 처리 간격 - 근거리용으로 단축")
  KNOWN_FACES_UPDATE_INTERVAL_SECONDS: int = 300
  DYNAMIC_CCTV_CHECK_INTERVAL_SECONDS: int = 300
  
  # Bounding Box Size Filtering (근거리 카메라용 설정)
  MIN_FACE_WIDTH: int = Field(default=80, description="최소 얼굴 너비 (픽셀) - 근거리용")
  MIN_FACE_HEIGHT: int = Field(default=80, description="최소 얼굴 높이 (픽셀) - 근거리용")
  MIN_FACE_AREA: int = Field(default=6400, description="최소 얼굴 면적 (픽셀²) - 근거리용")
  ENABLE_BBOX_SIZE_FILTER: bool = Field(default=True, description="바운딩박스 크기 필터링 활성화")

  class Config:
    env_file = ENV_FILE_PATH
    env_file_encoding = "utf-8"

settings = Settings()