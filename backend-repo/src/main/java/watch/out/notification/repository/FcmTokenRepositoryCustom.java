package watch.out.notification.repository;

import java.util.List;
import java.util.UUID;
import watch.out.notification.entity.FcmToken;

/**
 * FCM 토큰 커스텀 리포지토리 인터페이스
 */
public interface FcmTokenRepositoryCustom {

    /**
     * 특정 사용자의 유효한 FCM 토큰 조회 (null이 아닌 토큰만)
     */
    List<FcmToken> findByUserUuidAndFcmTokenIsNotNull(UUID userUuid);

    /**
     * 여러 사용자의 유효한 FCM 토큰 조회 (null이 아닌 토큰만)
     */
    List<FcmToken> findByUserUuidInAndFcmTokenIsNotNull(List<UUID> userUuids);

    /**
     * 특정 사용자의 FCM 토큰을 null로 업데이트 (로그아웃 시)
     */
    void clearFcmTokenByUserUuid(UUID userUuid);

    /**
     * 특정 FCM 토큰을 null로 업데이트
     */
    void clearFcmTokenByToken(String fcmToken);
}