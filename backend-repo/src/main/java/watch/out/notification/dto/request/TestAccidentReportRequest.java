package watch.out.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * 테스트용 사고 신고 알림 요청 DTO
 */
public record TestAccidentReportRequest(
    @Schema(description = "구역 UUID", example = "123e4567-e89b-12d3-a456-426614174001")
    @NotNull(message = "구역 UUID는 필수입니다")
    UUID areaUuid,
    
    @Schema(description = "구역명", example = "1구역")
    @NotBlank(message = "구역명은 필수입니다")
    String areaName,
    
    @Schema(description = "사고 유형", example = "부상")
    @NotBlank(message = "사고 유형은 필수입니다")
    String accidentType,
    
    @Schema(description = "신고자명", example = "홍길동")
    @NotBlank(message = "신고자명은 필수입니다")
    String reporterName,
    
    @Schema(description = "회사명", example = "ABC 건설")
    @NotBlank(message = "회사명은 필수입니다")
    String companyName,
    
    @Schema(description = "사고 UUID", example = "123e4567-e89b-12d3-a456-426614174002")
    @NotNull(message = "사고 UUID는 필수입니다")
    UUID accidentUuid
) {
}
