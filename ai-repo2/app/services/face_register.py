import uuid
import numpy as np
import requests
from datetime import datetime
import logging
from typing import List
from urllib.parse import urlparse
from fastapi import HTTPException, status
from fastapi.concurrency import run_in_threadpool

# 다른 모듈에서 필요한 기능들을 import
from app.services.face_embedding import face_embedding_service

class FaceRegistrationService:
  def __init__(self, conn):
    self.conn = conn

  async def register_face(self, user_uuid: uuid.UUID, s3_urls: List[str]):
    cursor = self.conn.cursor()
    try:
      # --- 1. 사용자 존재 여부 확인 ---
      cursor.execute("SELECT uuid FROM users WHERE uuid = %s", (str(user_uuid),))
      if cursor.fetchone() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

      # --- 2. 기존 얼굴 임베딩 데이터 삭제 ---
      logging.info(f"사용자 {user_uuid}의 기존 얼굴 임베딩 DB 데이터 삭제를 시작합니다.")
      cursor.execute("DELETE FROM face_embedding WHERE user_uuid = %s", (str(user_uuid),))

      # --- 3. 새 얼굴 임베딩 생성 및 저장 ---
      new_embeddings = []
      for url in s3_urls:
        try:
          # 무거운 I/O 작업을 별도 스레드에서 실행하여 비동기 성능 유지
          response = await run_in_threadpool(requests.get, url, timeout=10)
          response.raise_for_status()
          image_bytes = response.content
        except requests.RequestException as e:
          raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"URL에서 이미지를 가져올 수 없습니다: {url}")

        parsed_url = urlparse(str(url))
        s3_key = parsed_url.path.lstrip('/')

        try:
          # 무거운 CPU/GPU 작업을 별도 스레드에서 실행
          embedding_vector = await run_in_threadpool(face_embedding_service.generate_embedding, image_bytes)
        except ValueError as e: # generate_embedding에서 발생한 에러 처리
          raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

        new_embeddings.append(embedding_vector)
        now = datetime.now()

        # 개별 임베딩 정보를 face_embedding 테이블에 저장
        cursor.execute(
            "INSERT INTO face_embedding (uuid, embedding_vector, photo_key, created_at, updated_at, user_uuid) VALUES (%s, %s, %s, %s, %s, %s)",
            (str(uuid.uuid4()), embedding_vector.tobytes(), s3_key, now, now, str(user_uuid))
        )

      # --- 4. 평균 임베딩 계산 및 users 테이블 업데이트 ---
      avg_embedding = np.mean(new_embeddings, axis=0)
      cursor.execute(
          "UPDATE users SET avg_embedding = %s, updated_at = %s WHERE uuid = %s",
          (avg_embedding.tobytes(), datetime.now(), str(user_uuid))
      )

      self.conn.commit()
      logging.info(f"사용자 {user_uuid}의 얼굴 정보가 성공적으로 등록/갱신되었습니다.")
      return {"message": f"사용자 {user_uuid}의 얼굴 정보가 성공적으로 등록되었습니다."}

    except HTTPException as http_exc:
      # HTTP 예외는 그대로 다시 발생시켜 FastAPI가 처리하도록 함
      self.conn.rollback()
      raise http_exc
    except Exception as e:
      # 그 외 모든 예외는 서버 내부 오류로 처리
      self.conn.rollback()
      logging.error(f"얼굴 등록 서비스 처리 중 심각한 오류 발생: {e}")
      raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="서버 내부 오류로 얼굴 등록에 실패했습니다.")
    finally:
      cursor.close()