package watch.out.dashboard.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.accident.repository.AccidentRepository;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.dashboard.dto.request.AccidentStatusRequest;
import watch.out.dashboard.dto.response.AccidentStatusResponse;
import watch.out.dashboard.dto.response.AccidentStatusResponse.HourlyTrend;

/**
 * 사고 발생 현황 조회 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccidentStatusServiceImpl implements AccidentStatusService {

    private final AccidentRepository accidentRepository;
    private final AreaRepository areaRepository;

    @Override
    public AccidentStatusResponse getAccidentStatus(AccidentStatusRequest request) {
        List<UUID> areaUuids = getAreaUuids(request.areaUuids());

        // 단일 시점 기준으로 모든 통계 계산
        LocalDateTime now = LocalDateTime.now();

        // 오늘 현재 사고 건수
        Integer todayCurrent = getTodayCurrentAccidents(areaUuids, now);

        // 지난 7일 사고 건수
        Integer last7Days = getLast7DaysAccidents(areaUuids, now);

        // 시간별 추이 데이터 (최근 7시간)
        List<HourlyTrend> hourlyTrends = getHourlyTrends(areaUuids, now);

        return new AccidentStatusResponse(todayCurrent, last7Days, hourlyTrends);
    }

    /**
     * 구역 UUID 리스트 조회
     */
    private List<UUID> getAreaUuids(List<UUID> requestedAreaUuids) {
        if (requestedAreaUuids == null || requestedAreaUuids.isEmpty()) {
            return areaRepository.findAll().stream()
                .map(Area::getUuid)
                .toList();
        } else {
            return requestedAreaUuids;
        }
    }

    /**
     * 오늘 현재 사고 건수 조회
     */
    private Integer getTodayCurrentAccidents(List<UUID> areaUuids, LocalDateTime now) {
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();

        long count = accidentRepository.countAccidentsByTimeRange(areaUuids, todayStart, now);
        return (int) count;
    }

    /**
     * 지난 7일 사고 건수 조회
     */
    private Integer getLast7DaysAccidents(List<UUID> areaUuids, LocalDateTime now) {
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        long count = accidentRepository.countAccidentsByTimeRange(areaUuids, sevenDaysAgo, now);
        return (int) count;
    }

    /**
     * 시간별 추이 데이터 조회 (최근 7시간)
     */
    private List<HourlyTrend> getHourlyTrends(List<UUID> areaUuids, LocalDateTime now) {
        List<HourlyTrend> trends = new ArrayList<>();

        // 전체 조회 시간 범위 (최근 14일)
        LocalDateTime startTime = now.minusDays(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endTime = now;

        // 단일 쿼리로 모든 데이터 조회
        Map<Integer, Long> allStats = accidentRepository.getHourlyAccidentStatsOptimized(areaUuids,
            startTime, endTime);

        // 시간대 라벨 배열
        String[] timeLabels = {"-6시간", "-5시간", "-4시간", "-3시간", "-2시간", "-1시간", "현재"};

        // 결과를 시간대별로 정리
        for (int i = 7; i >= 1; i--) {
            int timeIndex = 7 - i;

            // current: 최근 7일간의 해당 시간대 사고 건수
            long current = allStats.getOrDefault(timeIndex, 0L);

            // previous: 이전 7일간의 해당 시간대 사고 건수
            long previous = allStats.getOrDefault(timeIndex + 7, 0L);

            // 시간대 라벨링 (배열 사용)
            String timeLabel = timeLabels[timeIndex];

            trends.add(new HourlyTrend(timeLabel, (int) current, (int) previous));
        }

        return trends;
    }

}
