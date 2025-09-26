package watch.out.safety.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import watch.out.common.util.S3Util;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

public record SafetyViolationResponse(
    UUID violationUuid,
    String areaName,
    String cctvName,
    List<SafetyViolationType> violationTypes,
    String imageUrl,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt
) {

    public static SafetyViolationResponse from(SafetyViolation violation, S3Util s3Util) {
        // S3 키를 URL로 변환
        String imageUrl = s3Util.keyToUrl(violation.getImageKey());

        // 위반 유형 리스트 추출
        List<SafetyViolationType> violationTypes = violation.getViolationDetails().stream()
            .map(detail -> detail.getViolationType())
            .toList();

        return new SafetyViolationResponse(
            violation.getUuid(),
            violation.getArea().getAreaName(),
            violation.getCctv().getCctvName(),
            violationTypes,
            imageUrl,
            violation.getCreatedAt()
        );
    }
}
