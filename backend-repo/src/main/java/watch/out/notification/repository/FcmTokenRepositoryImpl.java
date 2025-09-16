package watch.out.notification.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.querydsl.jpa.impl.JPAUpdateClause;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.notification.entity.FcmToken;
import watch.out.notification.entity.QFcmToken;

/**
 * FCM 토큰 커스텀 리포지토리 구현체 (QueryDSL 사용)
 */
@Repository
@RequiredArgsConstructor
public class FcmTokenRepositoryImpl implements FcmTokenRepositoryCustom {

    private final EntityManager entityManager;
    private final JPAQueryFactory queryFactory;

    @Override
    public List<FcmToken> findByUserUuidAndFcmTokenIsNotNull(UUID userUuid) {
        QFcmToken fcmToken = QFcmToken.fcmToken1;

        return queryFactory
            .selectFrom(fcmToken)
            .where(fcmToken.userUuid.eq(userUuid)
                .and(fcmToken.fcmToken.isNotNull()))
            .fetch();
    }

    @Override
    public List<FcmToken> findByUserUuidInAndFcmTokenIsNotNull(List<UUID> userUuids) {
        QFcmToken fcmToken = QFcmToken.fcmToken1;

        return queryFactory
            .selectFrom(fcmToken)
            .where(fcmToken.userUuid.in(userUuids)
                .and(fcmToken.fcmToken.isNotNull()))
            .fetch();
    }

    @Override
    public void clearFcmTokenByUserUuid(UUID userUuid) {
        QFcmToken fcmToken = QFcmToken.fcmToken1;

        new JPAUpdateClause(entityManager, fcmToken)
            .set(fcmToken.fcmToken, (String) null)
            .where(fcmToken.userUuid.eq(userUuid))
            .execute();
    }

    @Override
    public void clearFcmTokenByToken(String fcmTokenValue) {
        QFcmToken fcmToken = QFcmToken.fcmToken1;

        new JPAUpdateClause(entityManager, fcmToken)
            .set(fcmToken.fcmToken, (String) null)
            .where(fcmToken.fcmToken.eq(fcmTokenValue))
            .execute();
    }
}
