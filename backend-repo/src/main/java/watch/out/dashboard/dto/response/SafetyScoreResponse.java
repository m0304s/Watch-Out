package watch.out.dashboard.dto.response;

public record SafetyScoreResponse(
    Integer todayScore
) {

    public static SafetyScoreResponse of(Integer todayScore) {
        return new SafetyScoreResponse(todayScore);
    }
}