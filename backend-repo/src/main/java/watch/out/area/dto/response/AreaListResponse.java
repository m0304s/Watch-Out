package watch.out.area.dto.response;

import java.util.UUID;
import watch.out.area.entity.Area;

public record AreaListResponse(
    UUID areaUuid,
    String areaName,
    String areaAlias
) {

    public static AreaListResponse from(Area area) {
        return new AreaListResponse(
            area.getUuid(),
            area.getAreaName(),
            area.getAreaAlias()
        );
    }
}
