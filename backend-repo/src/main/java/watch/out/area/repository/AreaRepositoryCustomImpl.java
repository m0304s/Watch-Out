package watch.out.area.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.WorkerResponse;
import watch.out.area.entity.QArea;
import watch.out.area.entity.QAreaManager;
import watch.out.user.entity.QUser;
import watch.out.user.entity.UserRole;

@RequiredArgsConstructor
public class AreaRepositoryCustomImpl implements AreaRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<AreaListResponse> findAreasAsDto() {
        QArea area = QArea.area;

        return queryFactory
            .select(Projections.constructor(AreaListResponse.class,
                area.uuid,
                area.areaName,
                area.areaAlias))
            .from(area)
            .orderBy(area.areaName.asc(), area.areaAlias.asc())
            .fetch();
    }

    @Override
    public List<AreaListResponse> findAreasByUserUuidAsDto(UUID userUuid) {
        QArea area = QArea.area;
        QAreaManager areaManager = QAreaManager.areaManager;

        return queryFactory
            .select(Projections.constructor(AreaListResponse.class,
                area.uuid,
                area.areaName,
                area.areaAlias))
            .from(areaManager)
            .join(areaManager.area, area)
            .where(areaManager.user.uuid.eq(userUuid))
            .orderBy(area.areaName.asc(), area.areaAlias.asc())
            .fetch();
    }

    @Override
    public AreaDetailResponse findAreaDetailAsDto(UUID areaUuid) {
        QArea area = QArea.area;
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser manager = QUser.user;

        // 구역 정보와 관리자 정보를 함께 조회 (workers 제외)
        var result = queryFactory
            .select(area.uuid,
                area.areaName,
                area.areaAlias,
                manager.uuid,
                manager.userName)
            .from(area)
            .leftJoin(areaManager).on(areaManager.area.uuid.eq(area.uuid))
            .leftJoin(manager).on(areaManager.user.uuid.eq(manager.uuid)
                .and(manager.role.eq(UserRole.AREA_ADMIN)))
            .where(area.uuid.eq(areaUuid))
            .fetchOne();

        if (result == null) {
            return null;
        }

        // Tuple에서 값 추출하여 AreaDetailResponse 생성
        // workers는 별도 조회하므로 null로 설정 (Service에서 처리)
        return new AreaDetailResponse(
            result.get(area.uuid),
            result.get(area.areaName),
            result.get(area.areaAlias),
            result.get(manager.uuid),
            result.get(manager.userName),
            null // workers는 Service에서 별도 조회하여 설정
        );
    }

    @Override
    public List<WorkerResponse> findWorkersByAreaUuidAsDto(UUID areaUuid, int offset, int limit) {
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        return queryFactory
            .select(Projections.constructor(WorkerResponse.class,
                user.uuid,
                user.userName,
                user.userId))
            .from(areaManager)
            .join(areaManager.user, user)
            .where(areaManager.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.WORKER)))
            .orderBy(user.userName.asc())
            .offset(offset)
            .limit(limit)
            .fetch();
    }

    @Override
    public long countWorkersByAreaUuid(UUID areaUuid) {
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        return queryFactory
            .select(user.count())
            .from(areaManager)
            .join(areaManager.user, user)
            .where(areaManager.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.WORKER)))
            .fetchOne();
    }

    @Override
    public boolean hasAreaAccess(UUID userUuid, UUID areaUuid) {
        QAreaManager areaManager = QAreaManager.areaManager;

        return queryFactory
            .selectOne()
            .from(areaManager)
            .where(areaManager.user.uuid.eq(userUuid)
                .and(areaManager.area.uuid.eq(areaUuid)))
            .fetchFirst() != null;
    }
}
