package watch.out.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * 테스트용 중장비 진입 알림 요청 DTO
 */
public record TestHeavyEquipmentRequest(
    @Schema(description = "구역 UUID", example = "123e4567-e89b-12d3-a456-426614174001")
    @NotNull(message = "구역 UUID는 필수입니다")
    UUID areaUuid,
    
    @Schema(description = "구역명", example = "1구역")
    @NotBlank(message = "구역명은 필수입니다")
    String areaName,
    
    @Schema(description = "CCTV명", example = "CCTV-001")
    @NotBlank(message = "CCTV명은 필수입니다")
    String cctvName,
    
    @Schema(description = "중장비 유형 목록", example = "[\"Excavator\", \"Crane\"]")
    @NotNull(message = "중장비 유형 목록은 필수입니다")
    List<String> heavyEquipmentTypes
) {
}
