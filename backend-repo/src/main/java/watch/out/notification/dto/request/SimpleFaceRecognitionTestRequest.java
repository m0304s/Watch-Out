package watch.out.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 간단한 안면인식 성공 FCM 알림 테스트 요청 DTO
 */
public record SimpleFaceRecognitionTestRequest(
    @NotBlank(message = "출입 타입은 필수입니다.")
    @Pattern(regexp = "^(ENTRY|EXIT)$", message = "출입 타입은 ENTRY 또는 EXIT만 가능합니다.")
    String entryType
) {

}
