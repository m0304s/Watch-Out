package watch.out.notification.dto.response;

import java.util.List;
import lombok.Builder;
import watch.out.notification.entity.FcmToken;

@Builder
public record FcmTokenResponse(
    List<FcmTokenInfo> tokens
) {

    public static FcmTokenResponse from(FcmToken fcmToken) {
        return FcmTokenResponse.builder()
            .tokens(List.of(FcmTokenInfo.from(fcmToken)))
            .build();
    }

    public static FcmTokenResponse from(List<FcmToken> fcmTokens) {
        List<FcmTokenInfo> tokenInfos = fcmTokens.stream()
            .map(FcmTokenInfo::from)
            .toList();

        return FcmTokenResponse.builder()
            .tokens(tokenInfos)
            .build();
    }
}
