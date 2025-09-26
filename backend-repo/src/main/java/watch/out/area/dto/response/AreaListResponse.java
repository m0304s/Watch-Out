package watch.out.area.dto.response;

import java.util.UUID;

public record AreaListResponse(
    UUID areaUuid,
    String areaName,
    String areaAlias,
    String managerName
) {

}
