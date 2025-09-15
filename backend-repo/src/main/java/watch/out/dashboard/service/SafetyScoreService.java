package watch.out.dashboard.service;

import java.util.List;
import java.util.UUID;
import watch.out.dashboard.dto.response.SafetyScoreResponse;

public interface SafetyScoreService {

    /**
     * 구역 UUID 리스트에 해당하는 안전지수 통계를 조회합니다. areaUuids가 null이거나 비어있으면 모든 구역의 안전지수를 조회합니다. 다중 구역의 경우 평균
     * 안전지수를 반환합니다.
     *
     * @param areaUuids 구역 UUID 리스트 (null이거나 비어있으면 전체 구역)
     * @return 안전지수 통계 (단일 정수값)
     */
    SafetyScoreResponse getSafetyScores(List<UUID> areaUuids);
}
