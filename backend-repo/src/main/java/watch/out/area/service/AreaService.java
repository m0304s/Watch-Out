package watch.out.area.service;

import java.util.UUID;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.dto.response.AreaCountResponse;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.MyAreaResponse;
import watch.out.common.dto.PageResponse;
import watch.out.common.dto.PageRequest;

public interface AreaService {

    void createArea(AreaRequest areaRequest);

    PageResponse<AreaListResponse> getAreas(PageRequest pageRequest, String search);

    AreaDetailResponse getArea(UUID areaUuid, PageRequest pageRequest);

    void updateArea(UUID areaUuid, AreaRequest areaRequest);

    void deleteArea(UUID areaUuid);

    AreaCountResponse getMyAreaCount();

    MyAreaResponse getMyArea();
}
