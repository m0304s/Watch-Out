package watch.out.area.listener;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.entity.Area;
import watch.out.area.entity.EntryExit;
import watch.out.area.entity.EntryExitHistory;
import watch.out.area.repository.AreaRepository;
import watch.out.area.repository.EntryExitHistoryRepository;
import watch.out.cctv.dto.request.EntryExitEventRequest;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.user.entity.User;
import watch.out.user.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class EntryExitEventListener {

    private final EntryExitHistoryRepository entryExitHistoryRepository;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;

    @KafkaListener(
        topics = "${app.kafka.topic.access-events}",
        containerFactory = "consumerAccessEventsKafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeAccessEvent(EntryExitEventRequest event, Acknowledgment acknowledgment) {
        log.info("Received access event: userUuid={}, areaUuid={}", event.userUuid(),
            event.areaUuid());
        try {
            User user = userRepository.findById(UUID.fromString(event.userUuid()))
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

            Area area = areaRepository.findById(UUID.fromString(event.areaUuid()))
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

            EntryExitHistory history = EntryExitHistory.builder()
                .user(user)
                .area(area)
                .type(EntryExit.valueOf(event.eventType()))
                .build();

            entryExitHistoryRepository.save(history);

            acknowledgment.acknowledge();
            log.info("Successfully processed and acknowledged access event for user: {}",
                event.userUuid());

        } catch (Exception e) {
            log.error("Failed to process access event for user {}. Error: {}", event.userUuid(),
                e.getMessage());
        }
    }

    @KafkaListener(
        topics = "${app.kafka.topic.access-control}",
        containerFactory = "consumerAccessControlKafkaListenerContainerFactory"
    )
    public void consumeAccessControl(String message, Acknowledgment acknowledgment) {
        try {
            log.info("Received access control message: {}", message);
            // TODO: 수신된 제어 메시지에 따른 로직 처리
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process access control message. Error: {}", e.getMessage());
        }
    }
}