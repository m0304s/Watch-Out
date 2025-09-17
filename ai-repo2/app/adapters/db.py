# ai-repo2/app/adapters/db.py
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
  db_pool = psycopg2.pool.ThreadedConnectionPool(
      minconn=1,
      maxconn=10,
      user=settings.DB_USER,
      password=settings.DB_PASSWORD,
      host=settings.DB_HOST,
      port=settings.DB_PORT,
      dbname=settings.DB_NAME
  )
  logger.info("✅ DB 커넥션 풀 생성 완료!")
except Exception as e:
  logger.critical(f"❌ DB 커넥션 풀 생성 실패: {e}")
  db_pool = None

@contextmanager
def get_db_connection():
  if db_pool is None:
    raise ConnectionError("DB 커넥션 풀이 초기화되지 않았습니다.")
  conn = None
  try:
    conn = db_pool.getconn()
    yield conn
  finally:
    if conn:
      db_pool.putconn(conn)

# FastAPI의 Depends를 위한 함수
def get_db():
  with get_db_connection() as conn:
    yield conn