package watch.out.accident.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 사고 목록 조회 응답 DTO
 */
public record AccidentsResponse(
    String accidentId,
    String accidentType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp,
    AreaInfo areaInfo,
    WorkerInfo workerInfo
) {

    public static AccidentsResponse of(String accidentId, String accidentType,
        LocalDateTime timestamp,
        AreaInfo areaInfo, WorkerInfo workerInfo) {
        return new AccidentsResponse(accidentId, accidentType, timestamp, areaInfo, workerInfo);
    }

}
