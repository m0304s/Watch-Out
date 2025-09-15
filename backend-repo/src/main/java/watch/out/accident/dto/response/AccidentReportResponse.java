package watch.out.accident.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 사고 신고 응답 DTO
 */
public record AccidentReportResponse(
    String accidentId,
    String accidentType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp,
    AreaInfo areaInfo,
    WorkerInfo workerInfo
) {

    public static AccidentReportResponse of(String accidentId, String accidentType,
        LocalDateTime timestamp,
        AreaInfo areaInfo, WorkerInfo workerInfo) {
        return new AccidentReportResponse(accidentId, accidentType, timestamp, areaInfo,
            workerInfo);
    }

}
