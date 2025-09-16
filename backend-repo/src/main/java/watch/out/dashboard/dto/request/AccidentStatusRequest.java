package watch.out.dashboard.dto.request;

import java.util.List;
import java.util.UUID;

/**
 * 사고 발생 현황 조회 요청
 */
public record AccidentStatusRequest(
    List<UUID> areaUuids  // 구역 UUID 리스트 (null이면 모든 구역)
) {

}
