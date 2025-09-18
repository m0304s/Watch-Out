import cv2
import numpy as np
import threading
import time
import logging
from datetime import datetime, timedelta

from app.adapters.db import get_db_connection
from app.adapters.redis_client import get_redis_connection
from app.adapters.kafka_producer import send_event_to_kafka
from app.services.face_embedding import face_embedding_service # 싱글톤 모델 서비스
from app.config import settings

logger = logging.getLogger(__name__)

# 전역 변수 및 동기화 객체
running_camera_threads = {}
global_shutdown_event = threading.Event()
known_embeddings = {}
last_seen_at = {}
known_embeddings_lock = threading.Lock()
last_seen_at_lock = threading.Lock()

# --- DB 의존 로직 ---
def load_known_faces_from_db():
  global known_embeddings
  logger.info("DB에서 사용자 이름 및 얼굴 정보 업데이트 중...")
  temp_embeddings = {}
  try:
    with get_db_connection() as conn:
      cursor = conn.cursor()
      cursor.execute("SELECT uuid, user_name, avg_embedding FROM users WHERE avg_embedding IS NOT NULL")
      for user_uuid, user_name, embedding_bytes in cursor.fetchall():
        if len(embedding_bytes) == 512:
          embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
          temp_embeddings[str(user_uuid)] = {
            "name": user_name,
            "embedding": embedding
          }
        else:
          logger.warning(f"사용자 {user_uuid}의 임베딩 데이터 크기가 올바르지 않습니다.")
      cursor.close()

    with known_embeddings_lock:
      known_embeddings = temp_embeddings
    logger.info(f"✅ 총 {len(known_embeddings)}명의 사용자 정보 업데이트 완료!")
  except Exception as e:
    logger.error(f"DB 얼굴 정보 로드 실패: {e}")

def load_cameras_from_db():
  """DB에서 활성화된 CCTV 목록을 불러와 딕셔너리 리스트로 반환합니다."""
  logger.info("DB에서 CCTV 목록을 불러오는 중...")
  cameras = []
  try:
    with get_db_connection() as conn:
      cursor = conn.cursor()
      sql = "SELECT uuid, cctv_name, cctv_url, area_uuid FROM cctv WHERE area_uuid IS NOT NULL AND type = 'ACCESS'"
      cursor.execute(sql)
      for row in cursor.fetchall():
        cameras.append({
          'uuid': str(row[0]),
          'name': row[1],
          'url': row[2],
          'area_uuid': str(row[3])
        })
      cursor.close()
    logger.info(f"✅ 총 {len(cameras)}대의 카메라 정보를 불러왔습니다.")
    return cameras
  except Exception as e:
    logger.error(f"DB에서 카메라 정보 로드 실패: {e}")
    return []

def update_cctv_status(cctv_uuid: str, status: bool):
  """CCTV의 is_online 상태를 DB에 업데이트합니다."""
  try:
    with get_db_connection() as conn:
      cursor = conn.cursor()
      sql = "UPDATE cctv SET is_online = %s, updated_at = %s WHERE uuid = %s"
      cursor.execute(sql, (status, datetime.now(), cctv_uuid))
      conn.commit()
      cursor.close()
      logger.info(f"CCTV {cctv_uuid[:8]} 상태 변경: {'Online' if status else 'Offline'}")
  except Exception as e:
    logger.error(f"CCTV 상태 업데이트 실패 ({cctv_uuid[:8]}): {e}")

def find_best_match(live_embedding, current_known_embeddings):
  min_dist = float('inf')
  found_user_uuid = None
  if not current_known_embeddings: return None

  for user_uuid, user_info in current_known_embeddings.items():
    dist = np.sqrt(np.sum(np.square(live_embedding - user_info["embedding"])))
    if dist < min_dist:
      min_dist = dist
      found_user_uuid = user_uuid

  if min_dist < settings.RECOGNITION_THRESHOLD:
    return found_user_uuid
  return None

# --- 핵심 로직 (개별 카메라 처리) ---
def process_camera_stream(camera_info, thread_shutdown_event):
  cam_uuid, cam_name, cam_url, area_uuid = camera_info['uuid'], camera_info['name'], camera_info['url'], camera_info['area_uuid']
  redis_conn = get_redis_connection()
  cap = cv2.VideoCapture(cam_url)
  last_processed_time = time.time()
  is_stream_ok = cap.isOpened()

  update_cctv_status(cam_uuid, is_stream_ok)
  logger.info(f"카메라 [{cam_name}] 스트림 처리를 시작합니다. (초기 상태: {'Online' if is_stream_ok else 'Offline'})")

  while not global_shutdown_event.is_set() and not thread_shutdown_event.is_set():
    ret, frame = cap.read()

    if not ret:
      if is_stream_ok:
        logger.warning(f"[{cam_name}] 스트림 연결 끊김.")
        update_cctv_status(cam_uuid, False)
        is_stream_ok = False

      logger.warning(f"[{cam_name}] 10초 후 재연결을 시도합니다...")
      cap.release()
      time.sleep(10)
      cap = cv2.VideoCapture(cam_url)

      if cap.isOpened():
        logger.info(f"[{cam_name}] 스트림이 다시 연결되었습니다.")
        update_cctv_status(cam_uuid, True)
        is_stream_ok = True
      continue

    if time.time() - last_processed_time < settings.FRAME_PROCESSING_INTERVAL_SECONDS:
      continue
    last_processed_time = time.time()

    (h, w) = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
    face_embedding_service.face_detector.setInput(blob)
    detections = face_embedding_service.face_detector.forward()

    for i in range(0, detections.shape[2]):
      confidence = detections[0, 0, i, 2]
      if confidence > settings.DETECTION_CONFIDENCE:
        box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
        (startX, startY, endX, endY) = box.astype("int")
        face_roi = frame[startY:endY, startX:endX]
        if face_roi.size == 0: continue

        try:
          _, img_encoded = cv2.imencode('.jpg', face_roi)
          image_bytes = img_encoded.tobytes()
          live_embedding = face_embedding_service.generate_embedding(image_bytes)
        except ValueError:
          continue

        with known_embeddings_lock:
          current_known_embeddings = known_embeddings.copy()

        found_user_uuid = find_best_match(live_embedding, current_known_embeddings)

        if found_user_uuid:
          try:
            user_name = current_known_embeddings.get(found_user_uuid, {}).get('name', 'Unknown')
            log_user_info = f"{user_name}({found_user_uuid[:8]})"

            redis_key = f"area:{area_uuid}"
            is_member = redis_conn.sismember(redis_key, found_user_uuid)
            event_type = 'EXIT' if is_member else 'ENTRY'

            now = datetime.now()
            event_key = (area_uuid, found_user_uuid)
            with last_seen_at_lock:
              last_seen_time = last_seen_at.get(event_key)
              if not last_seen_time or (now - last_seen_time) > timedelta(seconds=settings.LOG_COOLDOWN_SECONDS):
                last_seen_at[event_key] = now
                if event_type == 'ENTRY':
                  redis_conn.sadd(redis_key, found_user_uuid)
                  logger.info(f"Redis SADD: User {log_user_info} to Area {area_uuid[:8]}")
                else: # EXIT
                  redis_conn.srem(redis_key, found_user_uuid)
                  logger.info(f"Redis SREM: User {log_user_info} from Area {area_uuid[:8]}")

                # ### 핵심 변경 지점 ###
                # Kafka로 전송할 이벤트 데이터를 생성합니다.
                event_data = {
                  'userUuid': found_user_uuid,
                  'userName': user_name,
                  'areaUuid': area_uuid,
                  'eventType': event_type,
                  'timestamp': now.isoformat() # ISO 8601 표준 형식으로 시간 전송
                }
                # Kafka Producer를 호출하여 이벤트를 전송합니다.
                send_event_to_kafka(settings.KAFKA_TOPIC_EVENTS, event_data)
                logger.info(f"🚀 Kafka Event Sent: User {log_user_info} - Event: {event_type}")

          except Exception as e:
            logger.error(f"Redis 또는 Kafka 전송 중 오류 발생: {e}")

  update_cctv_status(cam_uuid, False)
  cap.release()
  logger.info(f"카메라 [{cam_name}] 스트림 처리를 종료합니다.")

# --- 관리 로직 ---
def manage_camera_threads():
  try:
    db_cameras = load_cameras_from_db()
    db_cam_uuids = {cam['uuid'] for cam in db_cameras}
    running_cam_uuids = set(running_camera_threads.keys())

    for cam in db_cameras:
      if cam['uuid'] not in running_cam_uuids:
        logger.info(f"새로운 카메라 [{cam['name']}]({cam['uuid'][:8]})를 감지하여 스레드를 시작합니다.")
        thread_shutdown_event = threading.Event()
        thread = threading.Thread(
            target=process_camera_stream,
            args=(cam, thread_shutdown_event),
            name=f"CCTV-{cam['name']}",
            daemon=True
        )
        running_camera_threads[cam['uuid']] = {'thread': thread, 'shutdown': thread_shutdown_event}
        thread.start()

    for cam_uuid in list(running_cam_uuids):
      if cam_uuid not in db_cam_uuids:
        cam_info = running_camera_threads.get(cam_uuid)
        cam_name = cam_info['thread'].name if cam_info else "Unknown"
        logger.info(f"삭제된 카메라 [{cam_name}]({cam_uuid[:8]})를 감지하여 스레드를 종료합니다.")
        cam_info['shutdown'].set()
        cam_info['thread'].join(timeout=5)
        del running_camera_threads[cam_uuid]
  except Exception as e:
    logger.error(f"카메라 스레드 관리 중 오류 발생: {e}")

def update_known_faces_periodically():
  while not global_shutdown_event.is_set():
    load_known_faces_from_db()
    global_shutdown_event.wait(timeout=settings.KNOWN_FACES_UPDATE_INTERVAL_SECONDS)

# --- 서비스 시작/종료 함수 ---
def start_monitoring():
  """CCTV 모니터링을 위한 모든 백그라운드 스레드를 시작합니다."""
  if not hasattr(face_embedding_service, 'tf_sess'):
    logger.critical("FaceEmbeddingService가 초기화되지 않았습니다. 모니터링을 시작할 수 없습니다.")
    return

  # 백그라운드 스레드들 시작
  update_thread = threading.Thread(target=update_known_faces_periodically, name="FaceUpdater", daemon=True)
  monitor_thread = threading.Thread(target=manage_camera_threads_loop, name="CCTV-Manager", daemon=True)
  update_thread.start()
  monitor_thread.start()

  logger.info("🚀 모든 모니터링 백그라운드 스레드 시작 완료!")

def manage_camera_threads_loop():
  """주기적으로 카메라 목록을 확인하고 스레드를 관리하는 루프"""
  while not global_shutdown_event.is_set():
    manage_camera_threads()
    global_shutdown_event.wait(timeout=settings.DYNAMIC_CCTV_CHECK_INTERVAL_SECONDS)

def stop_monitoring():
  """애플리케이션 종료 시 모든 모니터링 스레드를 안전하게 종료합니다."""
  logger.info("모든 모니터링 스레드에 종료 신호를 보냅니다...")
  global_shutdown_event.set()

  logger.info("모든 카메라 스레드를 종료합니다...")
  for cam_uuid in list(running_camera_threads.keys()):
    thread_info = running_camera_threads[cam_uuid]
    thread_info['shutdown'].set()
    thread_info['thread'].join(timeout=5)

  logger.info("백그라운드 스레드를 종료합니다...")
  logger.info("모든 스레드 정리 완료.")