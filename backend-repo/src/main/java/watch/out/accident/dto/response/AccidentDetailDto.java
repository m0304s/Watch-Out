package watch.out.accident.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.accident.entity.AccidentType;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.RhFactor;

/**
 * QueryDSL Projection을 위한 중간 DTO
 */
public record AccidentDetailDto(
    UUID accidentId,
    AccidentType accidentType,
    LocalDateTime timestamp,
    UUID areaUuid,
    String areaName,
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
    public AccidentDetailResponse toResponse() {
        AccidentDetailResponse.AreaInfo areaInfo = new AccidentDetailResponse.AreaInfo(areaUuid,
            areaName);
        AccidentDetailResponse.WorkerInfo workerInfo = new AccidentDetailResponse.WorkerInfo(
            workerId, workerName, companyName, contact, emergencyContact, formatBloodType());

        return AccidentDetailResponse.of(accidentId.toString(), accidentType.getDescription(),
            timestamp, areaInfo, workerInfo);
    }

    /**
     * 혈액형을 표준 형식으로 포맷팅
     */
    private String formatBloodType() {
        if (bloodType == null || rhFactor == null) {
            return "알 수 없음";
        }

        String rhSymbol = (rhFactor == RhFactor.PLUS) ? "+" : "-";
        return bloodType.name() + rhSymbol;
    }

}
