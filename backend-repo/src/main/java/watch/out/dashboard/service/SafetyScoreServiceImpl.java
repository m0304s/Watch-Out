package watch.out.dashboard.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.accident.repository.AccidentRepository;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.dashboard.dto.response.SafetyScoreResponse;
import watch.out.safety.repository.SafetyViolationRepository;

@Service
@RequiredArgsConstructor
public class SafetyScoreServiceImpl implements SafetyScoreService {

    private final AccidentRepository accidentRepository;
    private final AreaRepository areaRepository;
    private final SafetyViolationRepository safetyViolationRepository;

    private static final int BASE_SCORE = 100;
    private static final int ACCIDENT_PENALTY = 5; // 사고 1건당 5점 차감
    private static final int SAFETY_EQUIPMENT_PENALTY = 2; // 안전장비 미착용 1건당 2점 차감
    private static final int MIN_SCORE = 0; // 최소 점수

    @Override
    @Transactional(readOnly = true)
    public SafetyScoreResponse getSafetyScores(List<UUID> areaUuids) {
        LocalDate today = LocalDate.now();

        // 구역 목록 조회 및 유효성 검사
        List<Area> areas = getAreas(areaUuids);
        validateAreas(areaUuids, areas);

        // 구역 UUID 리스트 추출
        List<UUID> foundAreaUuids = areas.stream()
            .map(Area::getUuid)
            .toList();

        // 배치 쿼리로 모든 구역의 사고 및 위반 건수 조회
        Map<UUID, Long> accidentCounts = accidentRepository.countAccidentsByAreasAndDate(
            foundAreaUuids, today);
        Map<UUID, Long> violationCounts = safetyViolationRepository.countViolationsByAreasAndDate(
            foundAreaUuids, today);

        // 각 구역의 안전지수 계산
        List<Integer> scores = areas.stream()
            .map(area -> calculateAreaSafetyScore(area, accidentCounts, violationCounts))
            .toList();

        // 평균 안전지수 계산
        double averageScore = scores.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);

        int todayScore = (int) Math.round(averageScore);

        return SafetyScoreResponse.of(todayScore);
    }

    /**
     * 구역 목록 조회
     */
    private List<Area> getAreas(List<UUID> areaUuids) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return areaRepository.findAll();
        } else {
            return areaRepository.findAllById(areaUuids);
        }
    }

    /**
     * 구역 유효성 검사
     */
    private void validateAreas(List<UUID> requestedAreaUuids, List<Area> foundAreas) {
        // areaUuids가 null이거나 비어있으면 모든 구역 조회이므로 검사하지 않음
        if (requestedAreaUuids == null || requestedAreaUuids.isEmpty()) {
            return;
        }

        // 요청된 구역이 하나도 없으면 예외 발생
        if (foundAreas.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        // 요청된 구역 수와 조회된 구역 수가 다르면 일부 구역이 존재하지 않음
        if (foundAreas.size() != requestedAreaUuids.size()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
    }

    /**
     * 구역별 안전지수 계산 (배치 쿼리 결과 사용)
     */
    private int calculateAreaSafetyScore(Area area, Map<UUID, Long> accidentCounts,
        Map<UUID, Long> violationCounts) {
        // 배치 쿼리 결과에서 해당 구역의 건수 조회 (없으면 0)
        long accidentCount = accidentCounts.getOrDefault(area.getUuid(), 0L);
        long violationCount = violationCounts.getOrDefault(area.getUuid(), 0L);

        // 안전지수 계산
        return calculateSafetyScore((int) accidentCount, (int) violationCount);
    }

    /**
     * 안전지수 계산 로직
     */
    private int calculateSafetyScore(int accidentCount, int violationCount) {
        int finalScore = BASE_SCORE
            - (accidentCount * ACCIDENT_PENALTY)
            - (violationCount * SAFETY_EQUIPMENT_PENALTY);

        return Math.max(finalScore, MIN_SCORE);
    }
}
