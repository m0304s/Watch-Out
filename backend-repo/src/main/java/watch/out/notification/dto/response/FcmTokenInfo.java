package watch.out.notification.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import watch.out.notification.entity.FcmToken;

@Builder
public record FcmTokenInfo(
    UUID uuid,
    String fcmToken,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    public static FcmTokenInfo from(FcmToken fcmToken) {
        return FcmTokenInfo.builder()
            .uuid(fcmToken.getUuid())
            .fcmToken(fcmToken.getFcmToken())
            .createdAt(fcmToken.getCreatedAt())
            .updatedAt(fcmToken.getUpdatedAt())
            .build();
    }
}
