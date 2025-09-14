package watch.out.accident.dto.response;

import java.util.UUID;

/**
 * 구역 정보 DTO
 */
public record AreaInfo(
    UUID areaUuid,
    String areaName
) {

    /**
     * 구역 정보 생성
     */
    public static AreaInfo of(UUID areaUuid, String areaName) {
        return new AreaInfo(areaUuid, areaName);
    }
}
