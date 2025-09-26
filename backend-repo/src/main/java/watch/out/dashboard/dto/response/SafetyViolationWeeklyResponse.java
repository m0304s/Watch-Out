package watch.out.dashboard.dto.response;

import java.util.List;

public record SafetyViolationWeeklyResponse(
    List<ViolationTypeStatisticsWeekly> days
) {

}
