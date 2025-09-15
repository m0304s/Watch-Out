package watch.out.dashboard.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record SafetyViolationStatusResponse(
    List<ViolationTypeStatistics> violationTypes
) {

}
