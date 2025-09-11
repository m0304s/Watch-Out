package watch.out.area.repository;

import java.util.List;
import java.util.UUID;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.WorkerResponse;

public interface AreaRepositoryCustom {

    List<AreaListResponse> findAreasAsDto();

    List<AreaListResponse> findAreasByUserUuidAsDto(UUID userUuid);

    AreaDetailResponse findAreaDetailAsDto(UUID areaUuid);

    List<WorkerResponse> findWorkersByAreaUuidAsDto(UUID areaUuid, int offset, int limit);

    long countWorkersByAreaUuid(UUID areaUuid);

    boolean hasAreaAccess(UUID userUuid, UUID areaUuid);
}
