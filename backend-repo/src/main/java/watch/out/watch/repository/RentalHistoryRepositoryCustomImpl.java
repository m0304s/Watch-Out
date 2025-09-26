package watch.out.watch.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import watch.out.watch.entity.QRentalHistory;
import watch.out.watch.entity.QWatch;

@RequiredArgsConstructor
public class RentalHistoryRepositoryCustomImpl implements RentalHistoryRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Integer> findWatchIdByUserUuid(UUID userUuid) {
        QRentalHistory rentalHistory = QRentalHistory.rentalHistory;
        QWatch watch = QWatch.watch;

        Integer watchId = queryFactory
            .select(watch.watchId)
            .from(rentalHistory)
            .join(rentalHistory.watch, watch)
            .where(
                rentalHistory.user.uuid.eq(userUuid),
                rentalHistory.returnedAt.isNull()
            )
            .fetchOne();

        return Optional.ofNullable(watchId);
    }
}
