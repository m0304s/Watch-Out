# ai-repo2/app/routes/faces_register.py
import uuid
from fastapi import APIRouter, Depends, Body, Path, status
from pydantic import BaseModel, HttpUrl, Field
from typing import List

from app.adapters.db import get_db
from app.services.face_register import FaceRegistrationService

router = APIRouter()

class FaceRegistrationRequest(BaseModel):
  s3_urls: List[HttpUrl] = Field(..., min_length=3, max_length=3)

@router.post(
    "/users/{user_uuid}/faces",
    status_code=status.HTTP_201_CREATED,
    summary="사용자 얼굴 정보 등록",
)
async def register_user_face_endpoint(
    user_uuid: uuid.UUID = Path(..., description="사용자 UUID"),
    payload: FaceRegistrationRequest = Body(...),
    db_conn=Depends(get_db)
):
  """
  3개의 S3 이미지 URL을 받아 사용자의 얼굴 정보를 등록/갱신합니다.
  """
  service = FaceRegistrationService(db_conn)
  return await service.register_face(user_uuid, [str(url) for url in payload.s3_urls])