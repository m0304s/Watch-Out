package watch.out.notification.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.notification.entity.FcmToken;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, UUID>,
    FcmTokenRepositoryCustom {

    /**
     * 모든 FCM 토큰 조회
     */
    List<FcmToken> findAll();

    /**
     * 특정 사용자의 FCM 토큰 조회
     */
    List<FcmToken> findByUserUuid(UUID userUuid);

    /**
     * 특정 토큰으로 FCM 토큰 조회
     */
    FcmToken findByFcmToken(String fcmToken);

    /**
     * 여러 사용자의 FCM 토큰 조회
     */
    List<FcmToken> findByUserUuidIn(List<UUID> userUuids);
}
