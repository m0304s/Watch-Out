package watch.out.area.dto.response;

import java.util.UUID;
import watch.out.common.dto.PageResponse;

public record AreaDetailResponse(
    UUID areaUuid,
    String areaName,
    String areaAlias,
    UUID managerUuid,
    String managerName,
    PageResponse<AreaDetailItemResponse> workers
) {

}
