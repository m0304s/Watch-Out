package watch.out.accident.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사고 목록 조회 응답 DTO
 */
public record AccidentListResponse(
    String accidentId,
    String accidentType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp,
    AreaInfo areaInfo,
    WorkerInfo workerInfo
) {

    public static AccidentListResponse of(String accidentId, String accidentType,
        LocalDateTime timestamp,
        AreaInfo areaInfo, WorkerInfo workerInfo) {
        return new AccidentListResponse(accidentId, accidentType, timestamp, areaInfo, workerInfo);
    }

    public record AreaInfo(
        UUID areaUuid,
        String areaName
    ) {

    }

    public record WorkerInfo(
        String workerId,
        String workerName,
        String companyName
    ) {

    }
}
