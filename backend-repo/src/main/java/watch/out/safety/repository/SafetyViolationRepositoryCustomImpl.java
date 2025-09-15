package watch.out.safety.repository;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.area.entity.QArea;
import watch.out.area.entity.QAreaManager;
import watch.out.cctv.entity.QCctv;
import watch.out.common.dto.PageRequest;
import watch.out.safety.entity.QSafetyViolation;
import watch.out.safety.entity.QSafetyViolationDetail;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.user.entity.QUser;

@Repository
@RequiredArgsConstructor
public class SafetyViolationRepositoryCustomImpl implements SafetyViolationRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QSafetyViolation safetyViolation = QSafetyViolation.safetyViolation;
    private final QSafetyViolationDetail violationDetail = QSafetyViolationDetail.safetyViolationDetail;
    private final QArea area = QArea.area;
    private final QAreaManager areaManager = QAreaManager.areaManager;

    @Override
    public List<SafetyViolation> findViolationList(PageRequest pageRequest, UUID areaUuid,
        SafetyViolationType violationType, LocalDateTime startDate, LocalDateTime endDate) {

        JPAQuery<SafetyViolation> query = queryFactory
            .selectFrom(safetyViolation)
            .leftJoin(safetyViolation.area, area).fetchJoin()
            .where(
                areaUuidEq(areaUuid),
                violationTypeEq(violationType),
                createdAtBetween(startDate, endDate)
            )
            .orderBy(safetyViolation.createdAt.desc());

        return query
            .offset((long) pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();
    }

    @Override
    public long countViolations(UUID areaUuid, SafetyViolationType violationType,
        LocalDateTime startDate, LocalDateTime endDate) {

        return queryFactory
            .selectFrom(safetyViolation)
            .where(
                areaUuidEq(areaUuid),
                violationTypeEq(violationType),
                createdAtBetween(startDate, endDate)
            )
            .fetchCount();
    }

    @Override
    public List<SafetyViolation> findViolationListForManager(PageRequest pageRequest,
        UUID managerUuid, UUID areaUuid, SafetyViolationType violationType, LocalDateTime startDate,
        LocalDateTime endDate) {

        JPAQuery<SafetyViolation> query = queryFactory
            .selectFrom(safetyViolation)
            .leftJoin(safetyViolation.area, area).fetchJoin()
            .leftJoin(areaManager).on(areaManager.area.uuid.eq(area.uuid))
            .where(
                areaManager.user.uuid.eq(managerUuid),
                areaUuidEq(areaUuid),
                violationTypeEq(violationType),
                createdAtBetween(startDate, endDate)
            )
            .orderBy(safetyViolation.createdAt.desc());

        return query
            .offset((long) pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();
    }

    @Override
    public long countViolationsForManager(UUID managerUuid, UUID areaUuid,
        SafetyViolationType violationType, LocalDateTime startDate, LocalDateTime endDate) {

        return queryFactory
            .selectFrom(safetyViolation)
            .leftJoin(areaManager).on(areaManager.area.uuid.eq(safetyViolation.area.uuid))
            .where(
                areaManager.user.uuid.eq(managerUuid),
                areaUuidEq(areaUuid),
                violationTypeEq(violationType),
                createdAtBetween(startDate, endDate)
            )
            .fetchCount();
    }

    @Override
    public long countViolationsByAreaAndDate(UUID areaUuid, LocalDate date) {
        return queryFactory
            .selectFrom(safetyViolation)
            .where(
                safetyViolation.area.uuid.eq(areaUuid),
                safetyViolation.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )
            )
            .fetchCount();
    }

    @Override
    public List<Object[]> getViolationStatisticsByType(LocalDate startDate, LocalDate endDate) {
        List<Tuple> results = queryFactory
            .select(
                violationDetail.violationType,
                violationDetail.violationType.count()
            )
            .from(violationDetail)
            .join(violationDetail.safetyViolation, safetyViolation)
            .where(createdAtBetween(startDate.atStartOfDay(), endDate.atTime(23, 59, 59)))
            .groupBy(violationDetail.violationType)
            .fetch();

        return results.stream()
            .map(tuple -> new Object[]{tuple.get(violationDetail.violationType),
                tuple.get(violationDetail.violationType.count())})
            .toList();
    }

    @Override
    public List<Object[]> getViolationStatisticsByArea(UUID areaUuid, LocalDate startDate,
        LocalDate endDate) {
        List<Tuple> results = queryFactory
            .select(
                area.areaName,
                violationDetail.violationType,
                violationDetail.violationType.count()
            )
            .from(violationDetail)
            .join(violationDetail.safetyViolation, safetyViolation)
            .leftJoin(safetyViolation.area, area)
            .where(
                areaUuidEq(areaUuid),
                createdAtBetween(startDate.atStartOfDay(), endDate.atTime(23, 59, 59))
            )
            .groupBy(area.areaName, violationDetail.violationType)
            .fetch();

        return results.stream()
            .map(tuple -> new Object[]{
                tuple.get(area.areaName),
                tuple.get(violationDetail.violationType),
                tuple.get(violationDetail.violationType.count())
            })
            .toList();
    }

    // 동적 쿼리를 위한 조건 메서드들
    private BooleanExpression areaUuidEq(UUID areaUuid) {
        return areaUuid != null ? safetyViolation.area.uuid.eq(areaUuid) : null;
    }

    private BooleanExpression violationTypeEq(SafetyViolationType violationType) {
        if (violationType == null) {
            return null;
        }
        // SafetyViolationDetail을 통한 위반 유형 필터링
        return queryFactory
            .selectFrom(safetyViolation)
            .join(safetyViolation.violationDetails, violationDetail)
            .where(violationDetail.violationType.eq(violationType))
            .exists();
    }

    private BooleanExpression createdAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return safetyViolation.createdAt.between(startDate, endDate);
        } else if (startDate != null) {
            return safetyViolation.createdAt.goe(startDate);
        } else if (endDate != null) {
            return safetyViolation.createdAt.loe(endDate);
        }
        return null;
    }

    @Override
    public Map<UUID, Long> countViolationsByAreasAndDate(List<UUID> areaUuids, LocalDate date) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return Map.of();
        }

        // SafetyViolationDetail 기준으로 카운트 (개별 위반 유형별로 계산)
        List<Tuple> results = queryFactory
            .select(
                safetyViolation.area.uuid,
                violationDetail.count()
            )
            .from(violationDetail)
            .join(violationDetail.safetyViolation, safetyViolation)
            .where(
                safetyViolation.area.uuid.in(areaUuids),
                safetyViolation.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )
            )
            .groupBy(safetyViolation.area.uuid)
            .fetch();

        return results.stream()
            .collect(Collectors.toMap(
                tuple -> tuple.get(safetyViolation.area.uuid),
                tuple -> tuple.get(violationDetail.count())
            ));
    }

    @Override
    public Map<UUID, List<SafetyViolation>> findViolationsByAreasAndDate(List<UUID> areaUuids,
        LocalDate date) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return Map.of();
        }

        List<SafetyViolation> violations = queryFactory
            .selectFrom(safetyViolation)
            .leftJoin(safetyViolation.area, area).fetchJoin()
            .leftJoin(safetyViolation.cctv, QCctv.cctv).fetchJoin()
            .leftJoin(safetyViolation.violationDetails, violationDetail).fetchJoin()
            .where(
                safetyViolation.area.uuid.in(areaUuids),
                safetyViolation.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )
            )
            .orderBy(safetyViolation.createdAt.desc())
            .fetch();

        return violations.stream()
            .collect(Collectors.groupingBy(
                violation -> violation.getArea().getUuid()
            ));
    }

    @Override
    public Map<String, Long> getViolationTypeStatisticsByAreas(List<UUID> areaUuids,
        LocalDate date) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return Map.of();
        }

        List<Tuple> results = queryFactory
            .select(
                violationDetail.violationType,
                violationDetail.violationType.count()
            )
            .from(violationDetail)
            .join(violationDetail.safetyViolation, safetyViolation)
            .where(
                safetyViolation.area.uuid.in(areaUuids),
                safetyViolation.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )
            )
            .groupBy(violationDetail.violationType)
            .fetch();

        return results.stream()
            .collect(Collectors.toMap(
                tuple -> tuple.get(violationDetail.violationType).name(),
                tuple -> tuple.get(violationDetail.violationType.count())
            ));
    }

    @Override
    public List<SafetyViolation> findViolationsByIndividualType(List<UUID> areaUuids,
        LocalDate date, String individualViolationType) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return List.of();
        }

        return queryFactory
            .selectFrom(safetyViolation)
            .leftJoin(safetyViolation.area, area).fetchJoin()
            .leftJoin(safetyViolation.cctv, QCctv.cctv).fetchJoin()
            .leftJoin(safetyViolation.violationDetails, violationDetail).fetchJoin()
            .where(
                safetyViolation.area.uuid.in(areaUuids),
                safetyViolation.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                ),
                violationDetail.violationType.stringValue().eq(individualViolationType)
            )
            .orderBy(safetyViolation.createdAt.desc())
            .fetch();
    }

}
