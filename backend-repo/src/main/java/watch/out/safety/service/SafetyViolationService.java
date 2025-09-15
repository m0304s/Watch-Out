package watch.out.safety.service;

import java.util.UUID;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

public interface SafetyViolationService {

    /**
     * 안전장비 위반 내역을 저장
     *
     * @param cctvUuid      CCTV UUID
     * @param areaUuid      구역 UUID
     * @param violationType 위반 유형 (단일 또는 복합)
     * @param imageKey      이미지 키 (S3 키)
     * @return 저장된 안전장비 위반 내역
     */
    SafetyViolation saveViolation(UUID cctvUuid, UUID areaUuid, SafetyViolationType violationType,
        String imageKey);
}
