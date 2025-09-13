package watch.out.accident.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccidentDetailResponse(
    String accidentId,
    String accidentType,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime timestamp,
    AreaInfo areaInfo,
    WorkerDetailInfo workerInfo
) {

    public static AccidentDetailResponse of(String accidentId, String accidentType,
        LocalDateTime timestamp,
        AreaInfo areaInfo, WorkerDetailInfo workerInfo) {
        return new AccidentDetailResponse(accidentId, accidentType, timestamp, areaInfo,
            workerInfo);
    }
}
