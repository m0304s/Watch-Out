package watch.out.cctv.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.HeavyEquipmentType;
import watch.out.cctv.util.HeavyEquipmentMapper;
import watch.out.notification.service.FcmService;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.common.util.S3Util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * FCM 알림 핸들러 구현체
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FcmNotificationHandlerImpl implements FcmNotificationHandler {

    private final FcmService fcmService;
    private final S3Util s3Util;

    @Override
    public void sendSafetyEquipmentViolationNotification(Cctv cctv,
        List<SafetyViolationType> violationTypes,
        String imageUrl, String areaName) {
        try {
            log.info("안전장비 미착용 FCM 알림 전송 시작: cctv={}, area={}, violations={}, imageUrl={}",
                cctv.getCctvName(), areaName, violationTypes, imageUrl);

            // 위반 유형을 문자열 리스트로 변환
            List<String> violationTypeStrings = violationTypes.stream()
                .map(this::getViolationTypeDisplayName)
                .toList();

            fcmService.sendSafetyViolationNotification(
                cctv.getArea().getUuid(),
                areaName,
                cctv.getCctvName(),
                violationTypeStrings,
                imageUrl
            );

            log.info("안전장비 미착용 FCM 알림 전송 완료: cctv={}, area={}",
                cctv.getCctvName(), areaName);

        } catch (Exception e) {
            log.error("안전장비 미착용 FCM 알림 전송 실패: cctv={}, area={}, error={}",
                cctv.getCctvName(), areaName, e.getMessage(), e);
        }
    }

    @Override
    public void sendHeavyEquipmentEntryNotification(Cctv cctv,
        Map<String, Integer> heavyEquipmentDetections,
        String snapshot, String areaName) {
        try {
            log.info("중장비 진입 FCM 알림 전송 시작: cctv={}, area={}, detections={}",
                cctv.getCctvName(), areaName, heavyEquipmentDetections);

            // 중장비 유형을 HeavyEquipmentType으로 변환
            List<HeavyEquipmentType> heavyEquipmentTypes = extractHeavyEquipmentTypes(
                heavyEquipmentDetections);

            if (heavyEquipmentTypes.isEmpty()) {
                log.warn("처리할 중장비가 없습니다: detections={}", heavyEquipmentDetections);
                return;
            }

            List<String> heavyEquipmentTypeStrings = heavyEquipmentTypes.stream()
                .map(this::getHeavyEquipmentTypeDisplayName)
                .toList();

            fcmService.sendSafetyViolationNotification(
                cctv.getArea().getUuid(),
                areaName,
                cctv.getCctvName(),
                heavyEquipmentTypeStrings,
                snapshot
            );

            log.info("중장비 진입 FCM 알림 전송 완료: cctv={}, area={}, types={}",
                cctv.getCctvName(), areaName, heavyEquipmentTypeStrings);

        } catch (Exception e) {
            log.error("중장비 진입 FCM 알림 전송 실패: cctv={}, area={}, error={}",
                cctv.getCctvName(), areaName, e.getMessage(), e);
        }
    }


    /**
     * 중장비 유형 추출
     */
    private List<HeavyEquipmentType> extractHeavyEquipmentTypes(
        Map<String, Integer> heavyEquipmentDetections) {
        List<HeavyEquipmentType> heavyEquipmentTypes = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : heavyEquipmentDetections.entrySet()) {
            String detectedClass = entry.getKey();
            HeavyEquipmentType heavyEquipmentType = HeavyEquipmentMapper.mapTriggerToHeavyEquipmentType(
                detectedClass);
            if (heavyEquipmentType != null) {
                heavyEquipmentTypes.add(heavyEquipmentType);
            }
        }

        return heavyEquipmentTypes;
    }

    /**
     * 위반 유형을 사용자 친화적인 이름으로 변환 기존 SafetyViolationType ENUM의 description 필드 사용
     */
    private String getViolationTypeDisplayName(SafetyViolationType violationType) {
        return violationType.getDescription();
    }

    /**
     * 중장비 유형을 사용자 친화적인 이름으로 변환 기존 HeavyEquipmentType ENUM의 description 필드 사용
     */
    private String getHeavyEquipmentTypeDisplayName(HeavyEquipmentType heavyEquipmentType) {
        return heavyEquipmentType.getDescription();
    }
}
