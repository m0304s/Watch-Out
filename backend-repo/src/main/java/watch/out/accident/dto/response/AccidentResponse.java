package watch.out.accident.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record AccidentResponse(
    String accidentId,
    String accidentType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp,
    AreaInfo areaInfo,
    WorkerDetailInfo workerInfo
) {

    public static AccidentResponse of(String accidentId, String accidentType,
        LocalDateTime timestamp,
        AreaInfo areaInfo, WorkerDetailInfo workerInfo) {
        return new AccidentResponse(accidentId, accidentType, timestamp, areaInfo,
            workerInfo);
    }
}
