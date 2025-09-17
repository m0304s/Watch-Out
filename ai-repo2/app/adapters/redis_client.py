# ai-repo2/app/adapters/redis_client.py
import redis
import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
  redis_pool = redis.ConnectionPool(
      host=settings.REDIS_HOST,
      port=settings.REDIS_PORT,
      db=settings.REDIS_DB,
      decode_responses=True # 응답을 자동으로 UTF-8로 디코딩
  )
  # 실제 연결 테스트
  r = redis.Redis(connection_pool=redis_pool)
  r.ping()
  logger.info("✅ Redis 커넥션 풀 생성 및 연결 테스트 완료!")
except redis.exceptions.ConnectionError as e:
  logger.critical(f"❌ Redis 연결 실패: {e}")
  redis_pool = None
except Exception as e:
  logger.critical(f"❌ Redis 커넥션 풀 생성 실패: {e}")
  redis_pool = None

def get_redis_connection():
  """Redis 커넥션 풀에서 커넥션을 가져오는 함수"""
  if redis_pool is None:
    raise ConnectionError("Redis 커넥션 풀이 초기화되지 않았습니다.")
  return redis.Redis(connection_pool=redis_pool)