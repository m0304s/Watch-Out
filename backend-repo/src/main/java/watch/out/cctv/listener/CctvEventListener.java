package watch.out.cctv.listener;

// com/acme/cctv/kafka/CctvEventListener.

import watch.out.cctv.dto.request.CctvEventRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class CctvEventListener {

    private static final Logger log = LoggerFactory.getLogger(CctvEventListener.class);
    private final ObjectMapper om = new ObjectMapper();

    @KafkaListener(topics = "${app.kafka.topic}")
    public void onMessage(ConsumerRecord<String, String> rec, Acknowledgment ack) {
        try {
            CctvEventRequest cctvEventRequest = om.readValue(rec.value(), CctvEventRequest.class);
            log.info("CCTV event key={} company={} camera={} triggers={} snapshot={}",
                rec.key(), cctvEventRequest.company(), cctvEventRequest.camera(),
                cctvEventRequest.triggers(), cctvEventRequest.snapshot());

            // TODO: DB 저장 / 알림 / 브로드캐스트
            ack.acknowledge();
        } catch (Exception e) {
            log.error("CCTV event fail, not committing. value={}", rec.value(), e);
            // 필요시 DLT 구성
        }
    }
}
