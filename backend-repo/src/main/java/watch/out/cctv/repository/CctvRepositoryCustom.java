package watch.out.cctv.repository;

import watch.out.cctv.dto.response.CctvResponse;
import watch.out.cctv.entity.Cctv;

import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;

public interface CctvRepositoryCustom {

    List<CctvResponse> findCctvsAsDto(UUID areaUuid, Boolean isOnline, String cctvName,
        PageRequest pageRequest);

    long countCctv(UUID areaUuid, Boolean isOnline, String cctvName);

    /**
     * CCTV 이름으로 CCTV 조회
     *
     * @param cctvName CCTV 이름
     * @return CCTV 엔티티 (Optional)
     */
    java.util.Optional<Cctv> findByCctvName(String cctvName);
}
