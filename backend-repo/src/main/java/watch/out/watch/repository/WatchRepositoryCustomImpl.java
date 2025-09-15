package watch.out.watch.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.entity.QUser;
import watch.out.watch.dto.response.QRentalHistoryResponse;
import watch.out.watch.dto.response.QWatchListResponse;
import watch.out.watch.dto.response.RentalHistoryResponse;
import watch.out.watch.dto.response.WatchListResponse;
import watch.out.watch.entity.QRentalHistory;
import watch.out.watch.entity.QWatch;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class WatchRepositoryCustomImpl implements WatchRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public PageResponse<WatchListResponse> findWatches(PageRequest pageRequest) {
        QWatch watch = QWatch.watch;
        QRentalHistory rentalHistory = QRentalHistory.rentalHistory;
        QUser user = QUser.user;

        List<WatchListResponse> content = queryFactory
            .select(new QWatchListResponse(
                watch.uuid,
                watch.watchId,
                watch.modelName,
                watch.status,
                rentalHistory.createdAt.max(), // 마지막 대여일시
                watch.note,
                user.userId
            ))
            .from(watch)
            .leftJoin(rentalHistory).on(rentalHistory.watch.eq(watch))
            .leftJoin(user)
            .on(rentalHistory.user.eq(user).and(rentalHistory.returnedAt.isNull())) // 현재 대여중인 사용자
            .groupBy(
                watch.uuid,
                watch.watchId,
                watch.modelName,
                watch.status,
                watch.note,
                user.userId
            )
            .orderBy(watch.watchId.desc())
            .offset((long) pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        Long total = queryFactory
            .select(watch.count())
            .from(watch)
            .fetchOne();

        return PageResponse.of(content, pageRequest.pageNum(), pageRequest.display(),
            total != null ? total : 0);
    }

    @Override
    public PageResponse<RentalHistoryResponse> findRentalHistoriesByWatchUuid(UUID watchUuid,
        PageRequest pageRequest) {
        QRentalHistory rentalHistory = QRentalHistory.rentalHistory;
        QUser user = QUser.user;

        List<RentalHistoryResponse> content = queryFactory
            .select(new QRentalHistoryResponse(
                user.uuid,
                user.userId,
                user.userName,
                rentalHistory.createdAt,
                rentalHistory.returnedAt
            ))
            .from(rentalHistory)
            .join(rentalHistory.user, user)
            .where(rentalHistory.watch.uuid.eq(watchUuid))
            .orderBy(rentalHistory.createdAt.desc())
            .offset((long) pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        Long total = queryFactory
            .select(rentalHistory.count())
            .from(rentalHistory)
            .where(rentalHistory.watch.uuid.eq(watchUuid))
            .fetchOne();

        return PageResponse.of(content, pageRequest.pageNum(), pageRequest.display(),
            total != null ? total : 0);
    }
}
