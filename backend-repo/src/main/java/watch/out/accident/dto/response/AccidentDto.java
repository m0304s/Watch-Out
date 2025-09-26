package watch.out.accident.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.accident.entity.AccidentType;
import watch.out.common.util.AreaNameUtil;
import watch.out.common.util.BloodTypeUtil;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.RhFactor;

/**
 * QueryDSL Projection을 위한 중간 DTO
 */
public record AccidentDto(
    UUID accidentId,
    AccidentType accidentType,
    LocalDateTime timestamp,
    UUID areaUuid,
    String areaName,
    String areaAlias,
    String workerId,
    String workerName,
    String companyName,
    String contact,
    String emergencyContact,
    BloodType bloodType,
    RhFactor rhFactor
) {

    /**
     * AccidentDetailResponse로 변환
     */
    public AccidentResponse toResponse() {
        AreaInfo areaInfo = AreaInfo.of(areaUuid, AreaNameUtil.formatAreaName(areaName, areaAlias));
        WorkerDetailInfo workerInfo = WorkerDetailInfo.of(
            workerId, workerName, companyName, contact, emergencyContact,
            BloodTypeUtil.formatBloodType(bloodType, rhFactor));

        return AccidentResponse.of(accidentId.toString(), accidentType.getDescription(),
            timestamp, areaInfo, workerInfo);
    }


}
