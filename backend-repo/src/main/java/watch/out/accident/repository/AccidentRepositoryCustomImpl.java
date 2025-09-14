package watch.out.accident.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.accident.dto.response.AccidentDetailDto;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.entity.AccidentType;

import static watch.out.accident.entity.QAccident.accident;
import static watch.out.area.entity.QArea.area;
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
            .orderBy(accident.createdAt.desc())
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
                area.areaName.as("areaName"),
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
}
