import os, json, threading, logging
from confluent_kafka import Consumer
from util.stream_workers import start_worker, stop_worker

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP", "localhost:9092")
CONTROL_TOPIC = os.getenv("KAFKA_TOPIC_CONTROL", "cctv.control")
GROUP_ID = os.getenv("KAFKA_GROUP_ID", "cctv-control-fastapi")

class ControlConsumer(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.c = Consumer({
            "bootstrap.servers": BOOTSTRAP,
            "group.id": GROUP_ID,
            "auto.offset.reset": "latest",
            "enable.auto.commit": True
        })
        self.running = True

    def stop(self):
        self.running = False
        try: self.c.close()
        except: pass

    def run(self):
        self.c.subscribe([CONTROL_TOPIC])
        while self.running:
            msg = self.c.poll(1.0)
            if msg is None or msg.error():
                continue
            try:
                payload = json.loads(msg.value())
                action = payload.get("action")
                company = payload.get("company")
                cams = payload.get("cameras") or []

                if action == "START":
                    for cam in cams:
                        start_worker(company, cam.get("camera"), cam.get("src"), bool(cam.get("mirror", True)))
                elif action == "STOP":
                    if cams:
                        for cam in cams:
                            stop_worker(company, cam.get("camera"))
                    else:
                        stop_worker(company)
                elif action == "STOP_ALL":
                    stop_worker(None)  # 필요 시 전체 중지 구현
            except Exception as e:
                logging.exception(f"Control message handling error: {e}")

_consumer: ControlConsumer | None = None
def start_control_consumer():
    global _consumer
    if _consumer is None:
        _consumer = ControlConsumer()
        _consumer.start()
