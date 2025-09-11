# util/kafka_client.py
import os, json, logging
from typing import Optional
from confluent_kafka import Producer

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")
CLIENT_ID = os.getenv("KAFKA_CLIENT_ID", "cctv-fastapi")

_cfg = {
    "bootstrap.servers": BOOTSTRAP,
    "client.id": CLIENT_ID,
    "enable.idempotence": True,
    "acks": "all",
    "compression.type": "lz4",
    "linger.ms": 50,
    "batch.num.messages": 1000,
    "retries": 2147483647,
    "max.in.flight.requests.per.connection": 5,
}

_producer: Optional[Producer] = None

def _get() -> Producer:
    global _producer
    if _producer is None:
        _producer = Producer(_cfg)
    return _producer

def send_json(topic: str, key: str, payload: dict):
    p = _get()
    def _cb(err, msg):
        if err:
            logging.error(f"Kafka delivery failed: {err}")
    p.produce(topic=topic, key=key,
              value=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
              on_delivery=_cb)
    p.poll(0)