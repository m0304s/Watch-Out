package watch.out.accident.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.accident.entity.AccidentType;

/**
 * 사고 목록 조회를 위한 QueryDSL Projection DTO
 */
public record AccidentsDto(
    UUID accidentId,
    AccidentType accidentType,
    LocalDateTime timestamp,
    UUID areaUuid,
    String areaName,
    String workerId,
    String workerName,
    String companyName
) {

    /**
     * AccidentListResponse로 변환
     */
    public AccidentsResponse toResponse() {
        AreaInfo areaInfo = AreaInfo.of(areaUuid, areaName);
        WorkerInfo workerInfo = WorkerInfo.of(workerId, workerName, companyName);

        return AccidentsResponse.of(
            accidentId.toString(),
            accidentType.getDescription(),
            timestamp,
            areaInfo,
            workerInfo
        );
    }
}
