package watch.out.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * 테스트용 안면인식 알림 요청 DTO
 */
public record TestFaceRecognitionRequest(
    @Schema(description = "사용자 UUID", example = "123e4567-e89b-12d3-a456-426614174000")
    @NotNull(message = "사용자 UUID는 필수입니다")
    UUID userUuid,
    
    @Schema(description = "구역 UUID", example = "123e4567-e89b-12d3-a456-426614174001")
    @NotNull(message = "구역 UUID는 필수입니다")
    UUID areaUuid,
    
    @Schema(description = "사용자명", example = "홍길동")
    @NotBlank(message = "사용자명은 필수입니다")
    String userName,
    
    @Schema(description = "구역명", example = "1구역")
    @NotBlank(message = "구역명은 필수입니다")
    String areaName,
    
    @Schema(description = "진입 유형", example = "ENTRY", allowableValues = {"ENTRY", "EXIT"})
    @NotBlank(message = "진입 유형은 필수입니다")
    String entryType,
    
    @Schema(description = "인식 시간 (선택사항)", example = "2024-01-15T10:30:00")
    String timestamp
) {
}
