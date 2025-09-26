import json
import logging
from kafka import KafkaProducer
from app.config import settings

logger = logging.getLogger(__name__)

try:
  # Kafka Producer 인스턴스를 생성합니다.
  # value_serializer는 메시지를 보내기 전에 어떻게 직렬화할지 지정합니다.
  # 여기서는 딕셔너리를 JSON 문자열로 변환 후 utf-8로 인코딩합니다.
  kafka_producer = KafkaProducer(
      bootstrap_servers=settings.KAFKA_BOOTSTRAP,
      value_serializer=lambda v: json.dumps(v).encode('utf-8'),
      acks='all',  # 'all': 리더와 모든 팔로워 브로커까지 메시지 저장을 확인하여 가장 높은 내구성 보장
      retries=3,    # 메시지 전송 실패 시 3번 재시도
      # 연결 타임아웃을 설정하여 무한 대기를 방지할 수 있습니다.
      request_timeout_ms=30000
  )
  logger.info(f"✅ Kafka Producer 생성 완료! (서버: {settings.KAFKA_BOOTSTRAP})")

except Exception as e:
  logger.critical(f"❌ Kafka Producer 생성 실패: {e}")
  kafka_producer = None

def get_kafka_producer():
  """
  생성된 Kafka Producer 인스턴스를 반환합니다.
  초기화되지 않은 경우, ConnectionError를 발생시켜 문제를 즉시 알립니다.
  """
  if kafka_producer is None:
    raise ConnectionError("Kafka Producer가 초기화되지 않았습니다. Kafka 서버 연결을 확인하세요.")
  return kafka_producer

def send_event_to_kafka(topic: str, event_data: dict):
  """
  지정된 토픽으로 이벤트 메시지를 전송하는 함수입니다.

  Args:
      topic (str): 메시지를 보낼 Kafka 토픽 이름
      event_data (dict): 전송할 이벤트 데이터 (JSON으로 직렬화 가능해야 함)
  """
  try:
    producer = get_kafka_producer()
    # producer.send()는 비동기적으로 작동하며 Future 객체를 반환합니다.
    future = producer.send(topic, value=event_data)

    # .get()을 사용하면 동기적으로 결과를 기다립니다. (디버깅 시 유용)
    # record_metadata = future.get(timeout=10)
    # logger.info(f"Kafka 메시지 전송 성공: Topic='{record_metadata.topic}', Partition='{record_metadata.partition}'")

  except Exception as e:
    logger.error(f"Kafka 메시지 전송 실패 (Topic: {topic}): {e}")