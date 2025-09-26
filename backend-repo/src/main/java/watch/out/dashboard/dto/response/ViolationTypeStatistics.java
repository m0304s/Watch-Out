package watch.out.dashboard.dto.response;

/**
 * 위반 유형별 통계
 */
public record ViolationTypeStatistics(
    String violationType,
    String description,
    Integer count
) {

}
