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

  # General Settings
  RECOGNITION_THRESHOLD: float = Field(default=1.0)
  DETECTION_CONFIDENCE: float = Field(default=0.7)
  INPUT_SIZE: Tuple[int, int] = (112, 112)
  LOG_COOLDOWN_SECONDS: int = 30
  FRAME_PROCESSING_INTERVAL_SECONDS: float = 1.0
  KNOWN_FACES_UPDATE_INTERVAL_SECONDS: int = 300
  DYNAMIC_CCTV_CHECK_INTERVAL_SECONDS: int = 300

  class Config:
    env_file = ENV_FILE_PATH
    env_file_encoding = "utf-8"

settings = Settings()