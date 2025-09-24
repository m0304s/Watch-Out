import cv2
import numpy as np
import sys
import os
import uuid
import random
import string
from datetime import datetime

# --- 1. 프로젝트 경로 설정 ---
# 이 스크립트가 app 폴더 내부의 모듈을 찾을 수 있도록 경로를 추가합니다.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- 2. 리팩토링된 모듈 임포트 ---
from app.services.face_embedding import face_embedding_service
from app.adapters.db import get_db_connection
from app.config import settings

# --- 3. 웹캠 캡처 기능 ---
def capture_face_and_get_bytes():
  """웹캠을 열어 얼굴을 캡처하고, 해당 영역을 이미지 바이트로 반환합니다."""
  cap = cv2.VideoCapture(0)
  if not cap.isOpened():
    print("❌ 웹캠을 열 수 없습니다. 카메라 연결을 확인하세요.")
    return None

  print("\n📷 웹캠을 시작합니다. 화면에 얼굴을 맞춰주세요.")
  print("   얼굴이 녹색 사각형 안에 명확하게 보일 때 'c' 키를 누르면 촬영됩니다.")
  print("   'q' 키를 누르면 프로그램을 종료합니다.")
  print(f"\n🔍 근거리 인식 설정:")
  print(f"   - 최소 얼굴 크기: {settings.MIN_FACE_WIDTH}x{settings.MIN_FACE_HEIGHT} 픽셀")
  print(f"   - 최소 면적: {settings.MIN_FACE_AREA} 픽셀²")
  print(f"   - 탐지 신뢰도: {settings.DETECTION_CONFIDENCE}")
  print(f"   - 인식 임계값: {settings.RECOGNITION_THRESHOLD}")

  while True:
    ret, frame = cap.read()
    if not ret:
      break

    display_frame = frame.copy()
    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
    face_embedding_service.face_detector.setInput(blob)
    detections = face_embedding_service.face_detector.forward()

    face_roi = None
    best_confidence = 0
    best_box = None

    for i in range(0, detections.shape[2]):
      confidence = detections[0, 0, i, 2]
      if confidence > settings.DETECTION_CONFIDENCE and confidence > best_confidence:
        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
        (startX, startY, endX, endY) = box.astype("int")
        
        # 바운딩박스 크기 필터링
        if settings.ENABLE_BBOX_SIZE_FILTER:
          face_width = endX - startX
          face_height = endY - startY
          face_area = face_width * face_height
          
          if (face_width < settings.MIN_FACE_WIDTH or 
              face_height < settings.MIN_FACE_HEIGHT or 
              face_area < settings.MIN_FACE_AREA):
            continue  # 크기가 작으면 스킵
        
        best_confidence = confidence
        best_box = box.astype("int")

    if best_box is not None:
      (startX, startY, endX, endY) = best_box
      face_width = endX - startX
      face_height = endY - startY
      face_area = face_width * face_height
      
      # 바운딩박스 그리기
      cv2.rectangle(display_frame, (startX, startY), (endX, endY), (0, 255, 0), 2)
      
      # 크기 정보 표시
      size_text = f"Size: {face_width}x{face_height} (Area: {face_area})"
      cv2.putText(display_frame, size_text, (startX, startY - 10), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
      
      # 최소 크기 요구사항 표시
      min_text = f"Min: {settings.MIN_FACE_WIDTH}x{settings.MIN_FACE_HEIGHT} (Area: {settings.MIN_FACE_AREA})"
      cv2.putText(display_frame, min_text, (10, 30), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
      
      face_roi = frame[startY:endY, startX:endX]

    cv2.imshow("Face Registration - Press 'c' to capture, 'q' to quit", display_frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('c'):
      if face_roi is not None and face_roi.size != 0:
        print("\n📸 얼굴 캡처 완료!")
        _, img_encoded = cv2.imencode('.jpg', face_roi)
        image_bytes = img_encoded.tobytes()
        cap.release()
        cv2.destroyAllWindows()
        return image_bytes
      else:
        print("⚠️  얼굴이 감지되지 않았습니다. 다시 시도해주세요.")
    elif key == ord('q'):
      print("등록을 취소했습니다.")
      break

  cap.release()
  cv2.destroyAllWindows()
  return None

# --- 4. 랜덤 사용자 정보 생성 기능 ---
def generate_random_user_info():
  """DB 등록에 필요한 랜덤 사용자 정보를 생성합니다."""
  print("\n🎲 랜덤 사용자 정보를 생성합니다...")

  # ====================================================================
  # ⚠️ 중요: 이 값을 실제 DB에 있는 회사 UUID로 바꿔주세요! ⚠️
  existing_company_uuid = "550e8400-e29b-41d4-a716-446655440201"
  # ====================================================================

  user_data = {
    'user_id': str(random.randint(1000000, 9999999)),
    'password': '00000000', # 간단한 비밀번호로 설정
    'user_name': f"LocalTestUser_{random.randint(100, 999)}",
    'photo_key': f"photos/local/{uuid.uuid4()}.jpg",
    'company_uuid': existing_company_uuid,
    'contact': f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
    'emergency_contact': f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
    'gender': random.choice(['MALE', 'FEMALE']),
    'blood_type': random.choice(['A', 'B', 'O', 'AB']),
    'rh_factor': random.choice(['PLUS', 'MINUS']), # +, - 대신 Enum 값으로
    'user_role': random.choice(['WORKER', 'AREA_ADMIN']),
  }
  print("✅ 랜덤 정보 생성 완료!")
  return user_data

# --- 5. DB 등록 기능 ---
def register_user_in_db(user_info, face_embedding):
  """사용자 정보와 얼굴 임베딩을 DB에 저장합니다."""
  with get_db_connection() as conn:
    try:
      print("\n💾 DB에 사용자 정보를 등록하는 중...")
      cursor = conn.cursor()

      sql = """
            INSERT INTO users (
                uuid, user_id, password, user_name, contact, emergency_contact,
                gender, blood_type, rh_factor, training_status, photo_key,
                user_role, created_at, updated_at, company_uuid,
                avg_embedding
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) \
            """
      now = datetime.now()
      new_uuid = str(uuid.uuid4())
      embedding_bytes = face_embedding.tobytes()

      params = (
        new_uuid, user_info['user_id'], user_info['password'], user_info['user_name'],
        user_info['contact'], user_info['emergency_contact'], user_info['gender'],
        user_info['blood_type'], user_info['rh_factor'], 'COMPLETED',
        user_info['photo_key'], user_info['user_role'], now, now,
        user_info['company_uuid'], embedding_bytes
      )

      cursor.execute(sql, params)
      conn.commit()
      cursor.close()
      print("\n" + "="*50)
      print(f"🎉 사용자 '{user_info['user_name']}' 님이 성공적으로 등록되었습니다!")
      print(f"   - UUID: {new_uuid}")
      print("="*50)
    except Exception as e:
      print(f"❌ DB 등록 오류: {e}")
      conn.rollback()

# --- 6. 메인 실행 로직 ---
def main():
  print("로컬 사용자 등록 스크립트를 시작합니다.")
  image_bytes = capture_face_and_get_bytes()
  if image_bytes is None:
    print("얼굴 캡처에 실패하여 등록을 중단합니다.")
    return

  try:
    # 캡처된 이미지로 임베딩 생성 (서비스 계층 사용)
    print("임베딩을 생성합니다...")
    embedding_vector = face_embedding_service.generate_embedding(image_bytes)
    print("✅ 임베딩 생성 완료!")
  except ValueError as e:
    print(f"❌ 임베딩 생성 실패: {e}")
    return

  user_info = generate_random_user_info()
  if user_info['company_uuid'] == "여기에-실제-회사-UUID를-입력하세요":
    print("\n⚠️  스크립트를 실행하기 전에 `existing_company_uuid` 값을 수정해야 합니다.")
    return

  register_user_in_db(user_info, embedding_vector)

if __name__ == '__main__':
  main()