package watch.out.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * 테스트용 안전장비 위반 알림 요청 DTO
 */
public record TestSafetyViolationRequest(
    @Schema(description = "구역 UUID", example = "123e4567-e89b-12d3-a456-426614174001")
    @NotNull(message = "구역 UUID는 필수입니다")
    UUID areaUuid,
    
    @Schema(description = "구역명", example = "1구역")
    @NotBlank(message = "구역명은 필수입니다")
    String areaName,
    
    @Schema(description = "CCTV명", example = "CCTV-001")
    @NotBlank(message = "CCTV명은 필수입니다")
    String cctvName,
    
    @Schema(description = "위반 유형 목록", example = "[\"Helmet off\", \"Belt off\"]")
    @NotNull(message = "위반 유형 목록은 필수입니다")
    List<String> violationTypes,
    
    @Schema(description = "위반 UUID (선택사항, 테스트용)", example = "123e4567-e89b-12d3-a456-426614174002")
    UUID violationUuid
) {
}
