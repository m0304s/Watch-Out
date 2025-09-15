package watch.out.dashboard.dto.response;

import java.util.List;

/**
 * 사고 발생 현황 조회 응답
 */
public record AccidentStatusResponse(
    Integer todayCurrent,           // 오늘 현재 사고 건수
    Integer last7Days,             // 지난 7일 사고 건수
    List<HourlyTrend> hourlyTrends // 시간별 추이 데이터
) {

    /**
     * 시간별 추이 데이터
     */
    public record HourlyTrend(
        String timeLabel,    // 시간 라벨 (예: "-7시간", "-6시간", ...)
        Integer current,     // 현재 기간 사고 건수
        Integer previous     // 이전 기간 사고 건수
    ) {

    }
}
