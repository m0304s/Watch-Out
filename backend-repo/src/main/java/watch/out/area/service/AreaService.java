package watch.out.area.service;

<<<<<<< HEAD
import watch.out.area.dto.request.AreaRequest;

public interface AreaService {
    void createArea(AreaRequest areaRequest);
=======
import java.util.List;
import java.util.UUID;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.common.dto.PageRequest;

public interface AreaService {

    void createArea(AreaRequest areaRequest);

    List<AreaListResponse> getAreas();

    AreaDetailResponse getArea(UUID areaUuid, PageRequest pageRequest);

    void updateArea(UUID areaUuid, AreaRequest areaRequest);

    void deleteArea(UUID areaUuid);
>>>>>>> 4ae8413d0e06788bb67b5f0ea64e7cfc65dc2023
}
