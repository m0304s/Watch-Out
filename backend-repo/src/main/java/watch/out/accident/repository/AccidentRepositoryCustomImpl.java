package watch.out.accident.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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

        return query.fetchOne();
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

        return query.fetchOne();
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

    /**
     * 사고 목록 조회를 위한 공통 QueryDSL 쿼리 빌더
     *
     * @return JPAQuery<AccidentListDto> 쿼리 빌더
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
            // endDate가 날짜만 입력된 경우 해당 날짜의 23:59:59까지 포함하도록 조정
            LocalDateTime adjustedEndDate = endDate.toLocalDate().atTime(23, 59, 59);
            query = query.where(accident.createdAt.loe(adjustedEndDate));
        }

        return query;
    }
}