# ai-repo2/app/adapters/s3_client.py
import boto3
import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
  # AWS 자격 증명이 없는 경우 None으로 처리될 수 있으므로 필터링
  s3_client_args = {
    "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
    "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
    "region_name": settings.AWS_REGION
  }
  s3_client = boto3.client(
      's3',
      **{k: v for k, v in s3_client_args.items() if v is not None}
  )
  # 버킷 존재 여부 확인으로 연결 테스트
  s3_client.head_bucket(Bucket=settings.S3_BUCKET)
  logger.info("✅ S3 클라이언트 생성 및 버킷 연결 테스트 완료!")
except Exception as e:
  logger.critical(f"❌ S3 클라이언트 생성 실패: {e}")
  s3_client = None

def get_s3_client():
  """생성된 S3 클라이언트를 반환하는 함수"""
  if s3_client is None:
    raise ConnectionError("S3 클라이언트가 초기화되지 않았습니다.")
  return s3_client