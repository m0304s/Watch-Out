package watch.out.area.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.AreaDetailItemResponse;
import watch.out.area.dto.response.MyAreaResponse;
import watch.out.area.entity.QArea;
import watch.out.area.entity.QAreaManager;
import watch.out.user.entity.QUser;
import watch.out.user.entity.UserRole;

@RequiredArgsConstructor
public class AreaRepositoryCustomImpl implements AreaRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private static final String NO_MANAGER = "";

    /**
     * 구역명 또는 별칭으로 검색하는 조건을 생성
     *
     * @param area   구역 Q클래스
     * @param search 검색어
     * @return 검색 조건 (검색어가 없으면 null)
     */
    private BooleanExpression createSearchCondition(QArea area, String search) {
        if (search == null || search.trim().isEmpty()) {
            return null;
        }

        String trimmedSearch = search.trim();
        return area.areaName.containsIgnoreCase(trimmedSearch)
            .or(area.areaAlias.containsIgnoreCase(trimmedSearch));
    }

    /**
     * 안전한 count 조회를 수행 fetchOne()을 사용하되 null 체크를 통해 NullPointerException을 방지
     *
     * @param query count 쿼리
     * @return count 결과 (결과가 없으면 0)
     */
    private Long safeCount(com.querydsl.jpa.impl.JPAQuery<Long> query) {
        Long result = query.fetchOne();
        return result != null ? result : 0L;
    }

    @Override
    public List<AreaListResponse> findAreasAsDto(int pageNum, int display, String search) {
        QArea area = QArea.area;
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        BooleanExpression searchCondition = createSearchCondition(area, search);

        var query = queryFactory
            .select(Projections.constructor(AreaListResponse.class,
                area.uuid,
                area.areaName,
                area.areaAlias,
                user.userName.coalesce(NO_MANAGER)))
            .from(area)
            .leftJoin(areaManager).on(areaManager.area.eq(area))
            .leftJoin(user).on(areaManager.user.eq(user));

        if (searchCondition != null) {
            query.where(searchCondition);
        }

        return query
            .orderBy(area.areaName.asc(), area.areaAlias.asc())
            .offset(pageNum * display)
            .limit(display)
            .fetch();
    }

    @Override
    public List<AreaListResponse> findAreasByUserUuidAsDto(UUID userUuid, int pageNum, int display,
        String search) {
        QArea area = QArea.area;
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        // 기본 조건: userUuid로 필터링
        BooleanExpression whereCondition = areaManager.user.uuid.eq(userUuid);

        // 검색 조건 추가
        BooleanExpression searchCondition = createSearchCondition(area, search);
        if (searchCondition != null) {
            whereCondition = whereCondition.and(searchCondition);
        }

        return queryFactory
            .select(Projections.constructor(AreaListResponse.class,
                area.uuid,
                area.areaName,
                area.areaAlias,
                user.userName.coalesce(NO_MANAGER)))
            .from(areaManager)
            .join(areaManager.area, area)
            .join(areaManager.user, user)
            .where(whereCondition)
            .orderBy(area.areaName.asc(), area.areaAlias.asc())
            .offset(pageNum * display)
            .limit(display)
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
        // workers는 Service에서 별도 조회하여 설정
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
    public List<AreaDetailItemResponse> findWorkersByAreaUuidAsDto(UUID areaUuid, int offset,
        int limit) {
        QUser user = QUser.user;

        return queryFactory
            .select(Projections.constructor(AreaDetailItemResponse.class,
                user.uuid,
                user.userName,
                user.userId))
            .from(user)
            .where(user.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.WORKER)))
            .orderBy(user.userName.asc())
            .offset(offset)
            .limit(limit)
            .fetch();
    }

    @Override
    public long countWorkersByAreaUuid(UUID areaUuid) {
        QUser user = QUser.user;

        return safeCount(queryFactory
            .select(user.count())
            .from(user)
            .where(user.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.WORKER))));
    }

    @Override
    public List<AreaDetailItemResponse> findManagersByAreaUuidAsDto(UUID areaUuid, int offset,
        int limit) {
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        return queryFactory
            .select(Projections.constructor(AreaDetailItemResponse.class,
                user.uuid,
                user.userName,
                user.userId))
            .from(areaManager)
            .join(areaManager.user, user)
            .where(areaManager.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.AREA_ADMIN)))
            .orderBy(user.userName.asc())
            .offset(offset)
            .limit(limit)
            .fetch();
    }

    @Override
    public long countManagersByAreaUuid(UUID areaUuid) {
        QAreaManager areaManager = QAreaManager.areaManager;
        QUser user = QUser.user;

        return safeCount(queryFactory
            .select(user.count())
            .from(areaManager)
            .join(areaManager.user, user)
            .where(areaManager.area.uuid.eq(areaUuid)
                .and(user.role.eq(UserRole.AREA_ADMIN))));
    }

    @Override
    public long countAreas(String search) {
        QArea area = QArea.area;

        BooleanExpression searchCondition = createSearchCondition(area, search);

        var query = queryFactory
            .select(area.count())
            .from(area);

        if (searchCondition != null) {
            query.where(searchCondition);
        }

        return safeCount(query);
    }

    @Override
    public long countAreasByUserUuid(UUID userUuid, String search) {
        QArea area = QArea.area;
        QAreaManager areaManager = QAreaManager.areaManager;

        // 기본 조건: userUuid로 필터링
        BooleanExpression whereCondition = areaManager.user.uuid.eq(userUuid);

        // 검색 조건 추가
        BooleanExpression searchCondition = createSearchCondition(area, search);
        if (searchCondition != null) {
            whereCondition = whereCondition.and(searchCondition);
        }

        return safeCount(queryFactory
            .select(area.count())
            .from(areaManager)
            .join(areaManager.area, area)
            .where(whereCondition));
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

    @Override
    public MyAreaResponse findMyAreaDetail(UUID userUuid) {

        QArea qArea = QArea.area;
        QAreaManager qAreaManager = QAreaManager.areaManager;
        QUser qUser = QUser.user;
        QUser qAreaManagerUser = new QUser("areaManagerUser");

        // 한 번의 조인 쿼리로 사용자 정보와 해당 구역의 담당자 정보를 모두 조회
        return queryFactory
            .select(Projections.constructor(MyAreaResponse.class,
                Expressions.stringTemplate("CAST({0} AS string)", qArea.uuid),
                qArea.areaName,
                Expressions.stringTemplate("CAST({0} AS string)", qAreaManagerUser.uuid),
                qAreaManagerUser.userName
            ))
            .from(qUser)
            .join(qUser.area, qArea)
            .join(qAreaManager)
                .on(qAreaManager.area.uuid.eq(qArea.uuid))
            .join(qAreaManagerUser)
                .on(qAreaManager.user.uuid.eq(qAreaManagerUser.uuid))
            .where(qUser.uuid.eq(userUuid)
                .and(qAreaManagerUser.role.eq(UserRole.AREA_ADMIN)))
            .fetchFirst();
    }


}
