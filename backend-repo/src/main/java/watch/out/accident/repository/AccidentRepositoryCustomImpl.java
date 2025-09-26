package watch.out.accident.repository;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.accident.dto.response.AccidentDto;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsDto;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.common.dto.PageRequest;

import static watch.out.accident.entity.QAccident.accident;
import static watch.out.area.entity.QArea.area;
import static watch.out.area.entity.QAreaManager.areaManager;
import static watch.out.user.entity.QUser.user;
import static watch.out.company.entity.QCompany.company;

@Repository
@RequiredArgsConstructor
public class AccidentRepositoryCustomImpl implements AccidentRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<AccidentResponse> findAccidentDetailById(UUID accidentUuid) {
        AccidentDto dto = buildAccidentQuery()
            .where(accident.uuid.eq(accidentUuid))
            .fetchOne();

        return Optional.ofNullable(dto).map(AccidentDto::toResponse);
    }

    @Override
    public List<AccidentResponse> findAccidentsWithFilters(UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        JPAQuery<AccidentDto> query = buildAccidentQuery();

        // 동적 조건 추가
        if (areaUuid != null) {
            query = query.where(accident.area.uuid.eq(areaUuid));
        }
        if (accidentType != null) {
            query = query.where(accident.type.eq(accidentType));
        }
        if (userUuid != null) {
            query = query.where(accident.user.uuid.eq(userUuid));
        }

        List<AccidentDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .fetch();

        return dtoList.stream()
            .map(AccidentDto::toResponse)
            .toList();
    }

    @Override
    public List<AccidentsResponse> findAccidentList(PageRequest pageRequest, UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate) {
        JPAQuery<AccidentsDto> query = buildAccidentListQuery();

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid, startDate, endDate);

        List<AccidentsDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .offset(pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        return dtoList.stream()
            .map(AccidentsDto::toResponse)
            .toList();
    }

    @Override
    public long countAccidents(UUID areaUuid, AccidentType accidentType, UUID userUuid,
        LocalDateTime startDate, LocalDateTime endDate) {
        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company);

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid, startDate, endDate);

        Long result = query.fetchOne();
        return result != null ? result : 0L;
    }

    @Override
    public List<AccidentsResponse> findAccidentListForManager(PageRequest pageRequest,
        UUID managerUuid, UUID areaUuid, AccidentType accidentType, UUID userUuid,
        LocalDateTime startDate, LocalDateTime endDate) {
        JPAQuery<AccidentsDto> query = buildAccidentListQuery();

        // 관리자가 관리하는 구역만 조회하도록 조인 추가
        query = query.innerJoin(areaManager).on(areaManager.area.uuid.eq(accident.area.uuid))
            .where(areaManager.user.uuid.eq(managerUuid));

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid, startDate, endDate);

        List<AccidentsDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .offset(pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        return dtoList.stream()
            .map(AccidentsDto::toResponse)
            .toList();
    }

    @Override
    public long countAccidentsForManager(UUID managerUuid, UUID areaUuid, AccidentType accidentType,
        UUID userUuid, LocalDateTime startDate, LocalDateTime endDate) {
        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company)
            .innerJoin(areaManager).on(areaManager.area.uuid.eq(accident.area.uuid))
            .where(areaManager.user.uuid.eq(managerUuid));

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid, startDate, endDate);

        Long result = query.fetchOne();
        return result != null ? result : 0L;
    }

    /**
     * 사고 조회를 위한 공통 QueryDSL 쿼리 빌더
     *
     * @return JPAQuery<AccidentDetailDto> 쿼리 빌더
     */
    private JPAQuery<AccidentDto> buildAccidentQuery() {
        return queryFactory
            .select(Projections.constructor(AccidentDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                area.areaAlias.as("areaAlias"),
                user.userId.as("workerId"),
                user.userName.as("workerName"),
                company.companyName.as("companyName"),
                user.contact.as("contact"),
                user.emergencyContact.as("emergencyContact"),
                user.bloodType.as("bloodType"),
                user.rhFactor.as("rhFactor")
            ))
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company);
    }

    @Override
    public long countAccidentsByDate(LocalDate date) {
        Long result = queryFactory
            .select(accident.count())
            .from(accident)
            .where(accident.createdAt.between(
                date.atStartOfDay(),
                date.atTime(23, 59, 59)
            ))
            .fetchOne();
        return result != null ? result : 0L;
    }

    @Override
    public long countAccidentsByAreaAndDate(UUID areaUuid, LocalDate date) {
        Long result = queryFactory
            .select(accident.count())
            .from(accident)
            .where(accident.area.uuid.eq(areaUuid)
                .and(accident.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )))
            .fetchOne();
        return result != null ? result : 0L;
    }

    /**
     * 사고 목록 조회를 위한 공통 QueryDSL 쿼리 빌더
     *
     * @return JPAQuery<AccidentsDto> 쿼리 빌더
     */
    private JPAQuery<AccidentsDto> buildAccidentListQuery() {
        return queryFactory
            .select(Projections.constructor(AccidentsDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                user.userId.as("workerId"),
                user.userName.as("workerName"),
                company.companyName.as("companyName")
            ))
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company);
    }

    /**
     * 사고 조회 필터링 조건을 적용하는 공통 메서드
     *
     * @param query        QueryDSL 쿼리
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 필터링 조건이 적용된 쿼리
     */
    private <T> JPAQuery<T> applyFilters(JPAQuery<T> query, UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate) {

        if (areaUuid != null) {
            query = query.where(accident.area.uuid.eq(areaUuid));
        }
        if (accidentType != null) {
            query = query.where(accident.type.eq(accidentType));
        }
        if (userUuid != null) {
            query = query.where(accident.user.uuid.eq(userUuid));
        }
        if (startDate != null) {
            query = query.where(accident.createdAt.goe(startDate));
        }
        if (endDate != null) {
            LocalDateTime adjustedEndDate = endDate.toLocalDate().atTime(23, 59, 59);
            query = query.where(accident.createdAt.loe(adjustedEndDate));
        }

        return query;
    }

    @Override
    public Map<UUID, Long> countAccidentsByAreasAndDate(List<UUID> areaUuids, LocalDate date) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return Map.of();
        }

        List<Tuple> results = queryFactory
            .select(
                accident.area.uuid,
                accident.count()
            )
            .from(accident)
            .where(
                accident.area.uuid.in(areaUuids),
                accident.createdAt.between(
                    date.atStartOfDay(),
                    date.atTime(23, 59, 59)
                )
            )
            .groupBy(accident.area.uuid)
            .fetch();

        return results.stream()
            .collect(Collectors.toMap(
                tuple -> tuple.get(accident.area.uuid),
                tuple -> tuple.get(accident.count())
            ));
    }

    @Override
    public long countAccidentsByTimeRange(List<UUID> areaUuids, LocalDateTime startTime,
        LocalDateTime endTime) {
        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident);

        if (areaUuids != null && !areaUuids.isEmpty()) {
            query = query.where(accident.area.uuid.in(areaUuids));
        }

        Long result = query
            .where(accident.createdAt.between(startTime, endTime))
            .fetchOne();

        return result != null ? result : 0L;
    }

    @Override
    public long countAccidentsLast7Days(List<UUID> areaUuids) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident);

        if (areaUuids != null && !areaUuids.isEmpty()) {
            query = query.where(accident.area.uuid.in(areaUuids));
        }

        Long result = query
            .where(accident.createdAt.between(sevenDaysAgo, now))
            .fetchOne();

        return result != null ? result : 0L;
    }


    @Override
    public Map<Integer, Long> getHourlyAccidentStatsOptimized(List<UUID> areaUuids,
        LocalDateTime startTime, LocalDateTime endTime) {

        List<LocalDateTime> accidentTimes = queryFactory
            .select(accident.createdAt)
            .from(accident)
            .where(accident.createdAt.between(startTime, endTime)
                .and(areaUuids != null && !areaUuids.isEmpty() ?
                    accident.area.uuid.in(areaUuids) : null))
            .fetch();

        Map<String, Long> dateHourStats = new HashMap<>();
        for (LocalDateTime accidentTime : accidentTimes) {
            String key = accidentTime.toLocalDate() + "_" + accidentTime.getHour();
            dateHourStats.put(key, dateHourStats.getOrDefault(key, 0L) + 1);
        }

        // 시간대별로 매핑 (0-6: current, 7-13: previous)
        Map<Integer, Long> stats = new HashMap<>();
        LocalDateTime now = endTime; // endTime을 기준으로 사용

        for (int i = 7; i >= 1; i--) {
            LocalDateTime hourStart = now.minusHours(i);
            LocalDateTime hourEnd = now.minusHours(i - 1).minusMinutes(1).minusSeconds(59);

            long current = getHourlyCountOptimized(dateHourStats, hourStart, hourEnd, 0, 7);
            long previous = getHourlyCountOptimized(dateHourStats, hourStart, hourEnd, 7, 7);

            int timeIndex = 7 - i;
            stats.put(timeIndex, current);           // current
            stats.put(timeIndex + 7, previous);      // previous
        }

        return stats;
    }

    /**
     * 특정 시간대의 N일간 사고 건수 합산
     */
    private long getHourlyCountOptimized(Map<String, Long> dateHourStats, LocalDateTime hourStart,
        LocalDateTime hourEnd, int dayOffset, int days) {
        long total = 0;

        for (int day = 0; day < days; day++) {
            LocalDateTime dayStart = hourStart.minusDays(dayOffset + day);
            LocalDateTime dayEnd = hourEnd.minusDays(dayOffset + day);

            LocalDateTime currentTime = dayStart;
            while (!currentTime.isAfter(dayEnd)) {
                String key = currentTime.toLocalDate() + "_" + currentTime.getHour();
                total += dateHourStats.getOrDefault(key, 0L);
                currentTime = currentTime.plusHours(1);
            }
        }

        return total;
    }

}
