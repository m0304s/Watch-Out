package watch.out.accident.repository;

import com.querydsl.core.types.Projections;
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
        AccidentDetailDto dto = queryFactory
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
            .leftJoin(accident.area, area)
            .leftJoin(accident.user, user)
            .leftJoin(user.company, company)
            .where(accident.uuid.eq(accidentUuid))
            .fetchOne();
            
        return dto != null ? Optional.of(dto.toResponse()) : Optional.empty();
    }

    @Override
    public List<AccidentDetailResponse> findAccidentsByArea(UUID areaUuid) {
        List<AccidentDetailDto> dtos = queryFactory
            .select(Projections.constructor(AccidentDetailDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                user.userId.as("workerId"),
                user.userName.as("workerName"),
                company.companyName.as("affiliation"),
                user.contact.as("contact"),
                user.emergencyContact.as("emergencyContact"),
                user.bloodType.as("bloodType"),
                user.rhFactor.as("rhFactor")
            ))
            .from(accident)
            .leftJoin(accident.area, area)
            .leftJoin(accident.user, user)
            .leftJoin(user.company, company)
            .where(accident.area.uuid.eq(areaUuid))
            .orderBy(accident.createdAt.desc())
            .fetch();
            
        return dtos.stream()
            .map(AccidentDetailDto::toResponse)
            .toList();
    }

    @Override
    public List<AccidentDetailResponse> findAccidentsByType(AccidentType accidentType) {
        List<AccidentDetailDto> dtos = queryFactory
            .select(Projections.constructor(AccidentDetailDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                user.userId.as("workerId"),
                user.userName.as("workerName"),
                company.companyName.as("affiliation"),
                user.contact.as("contact"),
                user.emergencyContact.as("emergencyContact"),
                user.bloodType.as("bloodType"),
                user.rhFactor.as("rhFactor")
            ))
            .from(accident)
            .leftJoin(accident.area, area)
            .leftJoin(accident.user, user)
            .leftJoin(user.company, company)
            .where(accident.type.eq(accidentType))
            .orderBy(accident.createdAt.desc())
            .fetch();
            
        return dtos.stream()
            .map(AccidentDetailDto::toResponse)
            .toList();
    }

    @Override
    public List<AccidentDetailResponse> findAccidentsByUser(UUID userUuid) {
        List<AccidentDetailDto> dtos = queryFactory
            .select(Projections.constructor(AccidentDetailDto.class,
                accident.uuid.as("accidentId"),
                accident.type.as("accidentType"),
                accident.createdAt.as("timestamp"),
                area.uuid.as("areaUuid"),
                area.areaName.as("areaName"),
                user.userId.as("workerId"),
                user.userName.as("workerName"),
                company.companyName.as("affiliation"),
                user.contact.as("contact"),
                user.emergencyContact.as("emergencyContact"),
                user.bloodType.as("bloodType"),
                user.rhFactor.as("rhFactor")
            ))
            .from(accident)
            .leftJoin(accident.area, area)
            .leftJoin(accident.user, user)
            .leftJoin(user.company, company)
            .where(accident.user.uuid.eq(userUuid))
            .orderBy(accident.createdAt.desc())
            .fetch();
            
        return dtos.stream()
            .map(AccidentDetailDto::toResponse)
            .toList();
    }
}
