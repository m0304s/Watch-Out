# ai-repo2/app/services/face_embedding.py

import cv2
import numpy as np
import onnxruntime as ort # tensorflow 대신 onnxruntime 임포트
import logging
from app.config import settings

class FaceEmbeddingService:
  def __init__(self):
    self.input_size = settings.INPUT_SIZE # (112, 112)
    self.detection_confidence = settings.DETECTION_CONFIDENCE
    self._load_models()

  def _load_models(self):
    logging.info("얼굴 탐지 및 ArcFace 임베딩 모델을 로드합니다...")
    try:
      # 얼굴 탐지 모델은 기존 Caffe 모델을 그대로 사용
      self.face_detector = cv2.dnn.readNetFromCaffe(settings.PROTOTXT_PATH, settings.CAFFE_MODEL_PATH)

      # ArcFace ONNX 모델 로드
      self.ort_session = ort.InferenceSession(settings.MODEL_PATH)
      self.input_name = self.ort_session.get_inputs()[0].name
      self.output_name = self.ort_session.get_outputs()[0].name

      logging.info("✅ 모델 로드 완료!")
    except Exception as e:
      logging.critical(f"❌ 모델 로드 실패: {e}")
      raise e

  def generate_embedding(self, image_bytes: bytes) -> np.ndarray:
    try:
      img_array = np.frombuffer(image_bytes, np.uint8)
      image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
      if image is None:
        raise ValueError("이미지 파일을 디코딩할 수 없습니다.")

      # 1. 얼굴 탐지 (기존과 동일)
      (h, w) = image.shape[:2]
      blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
      self.face_detector.setInput(blob)
      detections = self.face_detector.forward()

      best_detection_idx = np.argmax(detections[0, 0, :, 2])
      confidence = detections[0, 0, best_detection_idx, 2]

      if confidence <= self.detection_confidence:
        raise ValueError("이미지에서 기준치 이상의 얼굴을 찾을 수 없습니다.")

      box = detections[0, 0, best_detection_idx, 3:7] * np.array([w, h, w, h])
      (startX, startY, endX, endY) = box.astype("int")
      
      # 임베딩 등록 시에는 바운딩박스 크기 필터링을 하지 않음
      # 입출입 체크할 때만 바운딩박스 크기를 확인함
      
      face_roi = image[startY:endY, startX:endX]
      if face_roi.size == 0:
        raise ValueError("얼굴 영역이 유효하지 않습니다.")

      # 2. ArcFace 모델 입력에 맞게 전처리
      img_rgb = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
      img_resized = cv2.resize(img_rgb, self.input_size)
      img_preprocessed = (img_resized.astype(np.float32) - 127.5) / 128.0
      img_expanded = np.expand_dims(img_preprocessed, axis=0) # 최종 shape: (1, 112, 112, 3)

      # 3. ONNX 모델로 임베딩 추론
      embedding = self.ort_session.run([self.output_name], {self.input_name: img_expanded})[0][0]

      # 4. L2 정규화 (코사인 유사도 계산을 위해 필수)
      embedding = embedding / np.linalg.norm(embedding)
      return embedding

    except Exception as e:
      logging.error(f"임베딩 생성 중 오류 발생: {e}")
      raise ValueError(f"얼굴 특징 추출 실패: {e}")

# 싱글톤처럼 사용하기 위해 인스턴스를 미리 생성
face_embedding_service = FaceEmbeddingService()
