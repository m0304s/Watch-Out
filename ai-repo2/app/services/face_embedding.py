import cv2
import numpy as np
# 1. 원래대로 tensorflow 전체를 import 합니다.
import tensorflow as tf
import logging
from app.config import settings

class FaceEmbeddingService:
  def __init__(self):
    self.input_size = settings.INPUT_SIZE
    self.detection_confidence = settings.DETECTION_CONFIDENCE
    self._load_models()

  def _load_models(self):
    logging.info("얼굴 탐지 및 임베딩 모델을 로드합니다...")
    try:
      tf.compat.v1.disable_v2_behavior()

      self.face_detector = cv2.dnn.readNetFromCaffe(settings.PROTOTXT_PATH, settings.CAFFE_MODEL_PATH)

      graph_def = tf.compat.v1.GraphDef()
      graph_def.ParseFromString(open(settings.MODEL_PATH, 'rb').read())

      self.tf_sess = tf.compat.v1.Session(graph=tf.compat.v1.Graph())
      with self.tf_sess.graph.as_default():
        tf.import_graph_def(graph_def, name='')

      self.images_placeholder = self.tf_sess.graph.get_tensor_by_name('input:0')
      self.embeddings_tensor = self.tf_sess.graph.get_tensor_by_name('embeddings:0')
      logging.info("✅ 모델 로드 완료!")
    except Exception as e:
      logging.critical(f"❌ 모델 로드 실패: {e}")
      raise e

  def generate_embedding(self, image_bytes: bytes) -> np.ndarray:
    # 이 아래 부분은 수정할 필요 없습니다.
    try:
      img_array = np.frombuffer(image_bytes, np.uint8)
      image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
      if image is None:
        raise ValueError("이미지 파일을 디코딩할 수 없습니다.")

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
      
      # 바운딩박스 크기 필터링 (등록 시에도 적용)
      if settings.ENABLE_BBOX_SIZE_FILTER:
        face_width = endX - startX
        face_height = endY - startY
        face_area = face_width * face_height
        
        if (face_width < settings.MIN_FACE_WIDTH or 
            face_height < settings.MIN_FACE_HEIGHT or 
            face_area < settings.MIN_FACE_AREA):
          raise ValueError(f"얼굴 크기가 너무 작습니다: {face_width}x{face_height} (면적: {face_area}). 최소 크기: {settings.MIN_FACE_WIDTH}x{settings.MIN_FACE_HEIGHT} (면적: {settings.MIN_FACE_AREA})")
      
      face_roi = image[startY:endY, startX:endX]
      if face_roi.size == 0:
        raise ValueError("얼굴 영역이 유효하지 않습니다.")

      img_resized = cv2.resize(face_roi, self.input_size)
      img_preprocessed = (img_resized.astype(np.float32) - 127.5) / 128.0
      img_expanded = np.expand_dims(img_preprocessed, axis=0)
      feed_dict = {self.images_placeholder: img_expanded}
      return self.tf_sess.run(self.embeddings_tensor, feed_dict=feed_dict)[0]

    except Exception as e:
      logging.error(f"임베딩 생성 중 오류 발생: {e}")
      raise ValueError(f"얼굴 특징 추출 실패: {e}")

# 싱글톤처럼 사용하기 위해 인스턴스를 미리 생성
face_embedding_service = FaceEmbeddingService()