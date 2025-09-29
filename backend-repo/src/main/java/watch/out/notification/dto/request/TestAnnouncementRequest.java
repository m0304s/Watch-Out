package watch.out.notification.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * 테스트용 공지사항 알림 요청 DTO
 */
public record TestAnnouncementRequest(
    @Schema(description = "공지 제목", example = "테스트 공지사항")
    @NotBlank(message = "공지 제목은 필수입니다")
    String title,
    
    @Schema(description = "공지 내용", example = "이것은 테스트용 공지사항입니다.")
    @NotBlank(message = "공지 내용은 필수입니다")
    String content,
    
    @Schema(description = "대상 사용자 UUID 목록 (선택사항, 비어있으면 전체 사용자)", example = "[\"123e4567-e89b-12d3-a456-426614174000\"]")
    List<UUID> targetUserUuids,
    
    @Schema(description = "대상 구역 UUID (선택사항, 구역별 공지용)", example = "123e4567-e89b-12d3-a456-426614174001")
    UUID targetAreaUuid
) {
}
