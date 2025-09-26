package watch.out.cctv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.Type;
import watch.out.area.entity.Area;
import java.util.UUID;
import watch.out.area.entity.Area;

public record CreateCctvRequest(
    @Size(min = 1, max = 50, message = "cctvName은 1~50자여야 합니다")
    String cctvName,

    @NotBlank(message = "CCTV URL은 필수입니다")
    @Size(max = 100, message = "cctvUrl은 100자 이하여야 합니다")
    String cctvUrl,

    @NotNull
    boolean isOnline,

    @NotNull
    Type type,

    @NotNull
    UUID areaUuid
) {

    public Cctv toEntity(Area area) {
        return Cctv.builder()
            .cctvName(cctvName)
            .cctvUrl(cctvUrl)
            .isOnline(isOnline)
            .type(type)
            .area(area)
            .build();
    }
}
