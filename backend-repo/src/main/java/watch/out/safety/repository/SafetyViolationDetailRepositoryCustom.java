package watch.out.safety.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

public interface SafetyViolationDetailRepositoryCustom {

    /**
     * 특정 구역들의 특정 위반 유형을 포함한 위반 내역 조회
     */
    List<SafetyViolation> findViolationsByAreaAndViolationType(
        List<UUID> areaUuids,
        SafetyViolationType violationType,
        LocalDateTime startDate,
        LocalDateTime endDate
    );
}
