package watch.out.accident.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.accident.dto.response.AccidentDetailDto;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.dto.response.AccidentListDto;
import watch.out.accident.dto.response.AccidentListResponse;
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
    public Optional<AccidentDetailResponse> findAccidentDetailById(UUID accidentUuid) {
        AccidentDetailDto dto = buildAccidentQuery()
            .where(accident.uuid.eq(accidentUuid))
            .fetchOne();

        return Optional.ofNullable(dto).map(AccidentDetailDto::toResponse);
    }

    @Override
    public List<AccidentDetailResponse> findAccidentsWithFilters(UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        JPAQuery<AccidentDetailDto> query = buildAccidentQuery();

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

        List<AccidentDetailDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .fetch();

        return dtoList.stream()
            .map(AccidentDetailDto::toResponse)
            .toList();
    }

    /**
     * 사고 조회를 위한 공통 QueryDSL 쿼리 빌더
     *
     * @return JPAQuery<AccidentDetailDto> 쿼리 빌더
     */
    private JPAQuery<AccidentDetailDto> buildAccidentQuery() {
        return queryFactory
            .select(Projections.constructor(AccidentDetailDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.concat(
                    Expressions.cases()
                        .when(area.areaAlias.isNotNull())
                        .then(Expressions.stringTemplate("' '").concat(area.areaAlias))
                        .otherwise("")
                ).as("areaName"),
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
    public List<AccidentListResponse> findAccidentList(PageRequest pageRequest, UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        JPAQuery<AccidentListDto> query = buildAccidentListQuery();

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid);

        List<AccidentListDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .offset(pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        return dtoList.stream()
            .map(AccidentListDto::toResponse)
            .toList();
    }

    @Override
    public long countAccidents(UUID areaUuid, AccidentType accidentType, UUID userUuid) {
        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company);

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid);

        return query.fetchOne();
    }

    /**
     * 사고 목록 조회를 위한 공통 QueryDSL 쿼리 빌더
     *
     * @return JPAQuery<AccidentListDto> 쿼리 빌더
     */
    private JPAQuery<AccidentListDto> buildAccidentListQuery() {
        return queryFactory
            .select(Projections.constructor(AccidentListDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.concat(
                    Expressions.cases()
                        .when(area.areaAlias.isNotNull())
                        .then(Expressions.stringTemplate("' '").concat(area.areaAlias))
                        .otherwise("")
                ).as("areaName"),
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
     * @return 필터링 조건이 적용된 쿼리
     */
    private <T> JPAQuery<T> applyFilters(JPAQuery<T> query, UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {

        if (areaUuid != null) {
            query = query.where(accident.area.uuid.eq(areaUuid));
        }
        if (accidentType != null) {
            query = query.where(accident.type.eq(accidentType));
        }
        if (userUuid != null) {
            query = query.where(accident.user.uuid.eq(userUuid));
        }

        return query;
    }

    @Override
    public List<AccidentListResponse> findAccidentListForManager(PageRequest pageRequest,
        UUID managerUuid,
        UUID areaUuid, AccidentType accidentType, UUID userUuid) {
        JPAQuery<AccidentListDto> query = buildAccidentListQuery();

        // 관리자가 관리하는 구역만 조회하도록 조인 추가
        query = query.innerJoin(areaManager).on(areaManager.area.uuid.eq(accident.area.uuid))
            .where(areaManager.user.uuid.eq(managerUuid));

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid);

        List<AccidentListDto> dtoList = query
            .orderBy(accident.createdAt.desc())  // 최신 순 정렬
            .offset(pageRequest.pageNum() * pageRequest.display())
            .limit(pageRequest.display())
            .fetch();

        return dtoList.stream()
            .map(AccidentListDto::toResponse)
            .toList();
    }

    @Override
    public long countAccidentsForManager(UUID managerUuid, UUID areaUuid, AccidentType accidentType,
        UUID userUuid) {
        JPAQuery<Long> query = queryFactory
            .select(accident.count())
            .from(accident)
            .innerJoin(accident.area, area)
            .innerJoin(accident.user, user)
            .innerJoin(user.company, company)
            .innerJoin(areaManager).on(areaManager.area.uuid.eq(accident.area.uuid))
            .where(areaManager.user.uuid.eq(managerUuid));

        // 필터링 조건 적용
        query = applyFilters(query, areaUuid, accidentType, userUuid);

        return query.fetchOne();
    }
}
