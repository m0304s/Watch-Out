package watch.out.safety.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import watch.out.safety.entity.QSafetyViolation;
import watch.out.safety.entity.QSafetyViolationDetail;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

@Repository
@RequiredArgsConstructor
public class SafetyViolationDetailRepositoryCustomImpl implements
    SafetyViolationDetailRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    private final QSafetyViolation safetyViolation = QSafetyViolation.safetyViolation;
    private final QSafetyViolationDetail violationDetail = QSafetyViolationDetail.safetyViolationDetail;

    @Override
    public List<SafetyViolation> findViolationsByAreaAndViolationType(
        List<UUID> areaUuids,
        SafetyViolationType violationType,
        LocalDateTime startDate,
        LocalDateTime endDate
    ) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return List.of();
        }

        return queryFactory
            .selectDistinct(safetyViolation)
            .from(safetyViolation)
            .join(safetyViolation.violationDetails, violationDetail)
            .where(
                safetyViolation.area.uuid.in(areaUuids),
                violationDetail.violationType.eq(violationType),
                safetyViolation.createdAt.between(startDate, endDate)
            )
            .orderBy(safetyViolation.createdAt.desc())
            .fetch();
    }
}
