package watch.out.dashboard.dto.response;

import java.time.LocalDate;
import java.util.List;

public record ViolationTypeStatisticsWeekly(
    LocalDate date,
    List<ViolationTypeStatistics> items
) {

}
