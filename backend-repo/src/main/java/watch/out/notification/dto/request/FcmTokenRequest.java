package watch.out.notification.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record FcmTokenRequest(
    @NotBlank(message = "FCM 토큰은 필수입니다.")
    String token
) {

}
