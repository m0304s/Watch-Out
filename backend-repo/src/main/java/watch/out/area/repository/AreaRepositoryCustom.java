package watch.out.area.repository;

import java.util.List;
import java.util.UUID;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.AreaDetailItemResponse;

public interface AreaRepositoryCustom {

    List<AreaListResponse> findAreasAsDto(int page, int size, String search);

    List<AreaListResponse> findAreasByUserUuidAsDto(UUID userUuid, int page, int size,
        String search);

    long countAreas(String search);

    long countAreasByUserUuid(UUID userUuid, String search);

    AreaDetailResponse findAreaDetailAsDto(UUID areaUuid);

    List<AreaDetailItemResponse> findWorkersByAreaUuidAsDto(UUID areaUuid, int offset, int limit);

    long countWorkersByAreaUuid(UUID areaUuid);

    boolean hasAreaAccess(UUID userUuid, UUID areaUuid);
}
