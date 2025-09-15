package watch.out.cctv.dto.response;

import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.Type;
import java.util.UUID;

public record CctvResponse(
    UUID cctvUuid,
    String cctvName,
    String cctvUrl,
    boolean isOnline,
    Type type,
    UUID areaUuid,
    String areaName
) {

    public static CctvResponse fromEntity(Cctv cctv) {
        return new CctvResponse(
            cctv.getUuid(),
            cctv.getCctvName(),
            cctv.getCctvUrl(),
            cctv.isOnline(),
            cctv.getType(),
            cctv.getArea() == null ? null : cctv.getArea().getUuid(),
            cctv.getArea() == null ? null : cctv.getArea().getAreaName()
        );
    }
}
