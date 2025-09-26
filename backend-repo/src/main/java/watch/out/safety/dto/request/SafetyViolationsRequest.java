package watch.out.safety.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import watch.out.safety.entity.SafetyViolationType;

public record SafetyViolationsRequest(
    // 필터 조건들 (모두 선택사항)
    List<UUID> areaUuids,           // 구역 UUID 리스트
    SafetyViolationType violationType, // 위반 유형
    LocalDate startDate,            // 시작 날짜
    LocalDate endDate               // 종료 날짜
) {

}