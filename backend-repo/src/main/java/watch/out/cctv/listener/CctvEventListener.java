package watch.out.cctv.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import watch.out.cctv.dto.EquipmentClassification;
import watch.out.cctv.dto.request.CctvEventRequest;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.handler.FcmNotificationHandler;
import watch.out.cctv.repository.CctvRepository;
import watch.out.cctv.util.EquipmentTypeDetector;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.safety.service.SafetyViolationService;
import watch.out.safety.util.SafetyViolationMapper;
import watch.out.notification.service.FcmService;
import watch.out.common.util.S3Util;

@Component
@RequiredArgsConstructor
public class CctvEventListener {

    private static final Logger log = LoggerFactory.getLogger(CctvEventListener.class);
    private final ObjectMapper om = new ObjectMapper();
    private final SafetyViolationService safetyViolationService;
    private final CctvRepository cctvRepository;
    private final FcmNotificationHandler fcmNotificationHandler;
    private final FcmService fcmService;
    private final S3Util s3Util;

    @KafkaListener(
        topics = "${app.kafka.topic.cctv-events}",
        containerFactory = "cctvConsumerKafkaListenerContainerFactory"
    )
    @Transactional
    public void onMessage(ConsumerRecord<String, String> rec, Acknowledgment ack) {
        try {
            CctvEventRequest cctvEventRequest = om.readValue(rec.value(), CctvEventRequest.class);
            log.info(cctvEventRequest.toString());
            log.info("CCTV event key={} company={} camera={} triggers={} snapshot={}",
                rec.key(), cctvEventRequest.company(), cctvEventRequest.camera(),
                cctvEventRequest.triggers(), cctvEventRequest.snapshot());

            processDetectionEvents(cctvEventRequest);

            ack.acknowledge();
        } catch (Exception e) {
            log.error("CCTV event fail, not committing. value={}", rec.value(), e);
        }
    }

    /**
     * 장비 감지 이벤트를 처리 (안전장비/중장비 구분)
     */
    private void processDetectionEvents(CctvEventRequest cctvEventRequest) {
        Map<String, Integer> detections = cctvEventRequest.detections();
        if (detections == null || detections.isEmpty()) {
            return;
        }

        // CCTV 정보 조회
        Cctv cctv = findCctvByName(cctvEventRequest.camera());

        if (cctv == null) {
            log.warn("CCTV를 찾을 수 없습니다. camera={}", cctvEventRequest.camera());
            return;
        }

        String areaName = cctv.getArea().getAreaName();
        log.info("감지된 객체들: {}", detections);

        // 감지된 객체들을 장비 유형별로 분류
        EquipmentClassification classification = classifyDetectedObjects(detections, cctv,
            areaName);

        // 안전장비 위반 처리
        if (!classification.safetyEquipmentClasses().isEmpty()) {
            processSafetyEquipmentViolations(cctv, classification.safetyEquipmentClasses(),
                cctvEventRequest.snapshot(), areaName);
        }

        // 중장비 감지 처리
        if (!classification.heavyEquipmentDetections().isEmpty()) {
            processHeavyEquipmentDetections(cctv, classification.heavyEquipmentDetections(),
                cctvEventRequest.snapshot(), areaName);
        }
    }


    /**
     * 카메라명으로 CCTV 조회
     */
    private Cctv findCctvByName(String camera) {
        return cctvRepository.findByCctvName(camera).orElse(null);
    }

    /**
     * 감지된 객체들을 장비 유형별로 분류
     */
    private EquipmentClassification classifyDetectedObjects(Map<String, Integer> detections,
        Cctv cctv, String areaName) {
        Set<String> safetyEquipmentClasses = new HashSet<>();
        Map<String, Integer> heavyEquipmentDetections = new HashMap<>();

        for (Map.Entry<String, Integer> entry : detections.entrySet()) {
            String detectedClass = entry.getKey();
            Integer count = entry.getValue();

            if (count == null || count <= 0) {
                continue;
            }

            EquipmentTypeDetector.EquipmentType equipmentType = EquipmentTypeDetector.getEquipmentType(
                detectedClass);

            switch (equipmentType) {
                case SAFETY_EQUIPMENT:
                    if (SafetyViolationMapper.isSafetyEquipmentTrigger(detectedClass)) {
                        safetyEquipmentClasses.add(detectedClass);
                    }
                    break;
                case HEAVY_EQUIPMENT:
                    heavyEquipmentDetections.put(detectedClass, count);
                    break;
                case UNKNOWN:
                default:
                    log.info("알 수 없는 장비 감지: class={}, count={}, cctv={}, area={}",
                        detectedClass, count, cctv.getCctvName(), areaName);
                    break;
            }
        }

        return new EquipmentClassification(safetyEquipmentClasses, heavyEquipmentDetections);
    }

    /**
     * 안전장비 위반 처리 - 모듈화된 핸들러 사용
     */
    private void processSafetyEquipmentViolations(Cctv cctv, Set<String> safetyEquipmentClasses,
        String snapshot, String areaName) {
        List<SafetyViolationType> violationTypes = extractViolationTypes(safetyEquipmentClasses);

        if (violationTypes.isEmpty()) {
            return;
        }

        // 중복 제거
        Set<SafetyViolationType> uniqueViolationTypes = new HashSet<>(violationTypes);
        List<SafetyViolationType> finalViolationTypes = new ArrayList<>(uniqueViolationTypes);

        log.info("안전장비 위반 감지: classes={}, violationTypes={}",
            safetyEquipmentClasses, finalViolationTypes);

        // 안전장비 위반 내역 저장 및 FCM 알림 전송
        processSafetyEquipmentViolation(cctv, finalViolationTypes, snapshot, areaName);
    }

    /**
     * 안전장비 위반 유형 추출
     */
    private List<SafetyViolationType> extractViolationTypes(Set<String> safetyEquipmentClasses) {
        List<SafetyViolationType> violationTypes = new ArrayList<>();

        for (String detectedClass : safetyEquipmentClasses) {
            SafetyViolationType violationType = SafetyViolationMapper.mapTriggerToViolationType(
                detectedClass);
            if (violationType != null && violationType.name().endsWith("_OFF")) {
                violationTypes.add(violationType);
            }
        }

        return violationTypes;
    }

    /**
     * 중장비 감지 처리 - 모듈화된 핸들러 사용
     */
    private void processHeavyEquipmentDetections(Cctv cctv,
        Map<String, Integer> heavyEquipmentDetections,
        String snapshot, String areaName) {

        log.info("중장비 감지: cctv={}, area={}, detections={}",
            cctv.getCctvName(), areaName, heavyEquipmentDetections);

        // 기존 로그 출력
        for (Map.Entry<String, Integer> entry : heavyEquipmentDetections.entrySet()) {
            processHeavyEquipmentDetection(cctv, entry.getKey(), snapshot, areaName,
                entry.getValue());
        }

        // FCM 알림 전송
        fcmNotificationHandler.sendHeavyEquipmentEntryNotification(
            cctv, heavyEquipmentDetections, snapshot, areaName);
    }

    /**
     * 안전장비 위반 처리
     */
    private void processSafetyEquipmentViolation(Cctv cctv,
        List<SafetyViolationType> violationTypes, String snapshot, String areaName) {
        if (violationTypes != null && !violationTypes.isEmpty()) {
            try {
                // 안전장비 위반 내역 저장
                SafetyViolation savedViolation = safetyViolationService.saveViolation(
                    cctv.getUuid(),
                    cctv.getArea().getUuid(),
                    violationTypes,
                    snapshot
                );

                log.info("안전장비 위반 내역 저장 완료: cctv={}, area={}, types={}, imageKey={}",
                    cctv.getCctvName(), areaName, violationTypes, savedViolation.getImageKey());

                // 저장된 이미지 키를 URL로 변환하여 FCM 알림 전송
                String imageUrl = s3Util.keyToUrl(savedViolation.getImageKey());
                sendSafetyViolationNotification(cctv, areaName, violationTypes, imageUrl);
            } catch (Exception e) {
                log.error("안전장비 위반 내역 저장 실패: types={}, error={}", violationTypes, e.getMessage(),
                    e);
            }
        }
    }

    /**
     * 중장비 감지 처리 (로그만 출력)
     */
    private void processHeavyEquipmentDetection(Cctv cctv, String detectedClass, String snapshot,
        String areaName, Integer count) {
        log.info("중장비 감지: cctv={}, area={}, equipment={}, count={}, image={}",
            cctv.getCctvName(), areaName, detectedClass, count, snapshot);

        // TODO: 중장비 관련 추가 처리 로직 구현
    }


    /**
     * 안전장비 위반 FCM 알림 전송 (구역별 담당자에게만)
     */
    private void sendSafetyViolationNotification(Cctv cctv, String areaName,
        List<SafetyViolationType> violationTypes, String imageUrl) {
        try {
            // 위반 유형을 문자열 리스트로 변환
            List<String> violationTypeNames = violationTypes.stream()
                .map(Enum::name)
                .toList();

            // 해당 구역의 담당자들에게만 FCM 알림 전송
            fcmService.sendSafetyViolationNotification(
                cctv.getArea().getUuid(),  // 구역 UUID 추가
                areaName,
                cctv.getCctvName(),
                violationTypeNames,
                imageUrl
            );

            log.info("FCM 안전장비 위반 알림 전송 완료: area={}, cctv={}, types={}, imageUrl={}",
                areaName, cctv.getCctvName(), violationTypeNames, imageUrl);

        } catch (Exception e) {
            log.error("FCM 안전장비 위반 알림 전송 실패: area={}, cctv={}", areaName, cctv.getCctvName(), e);
        }
    }
}
