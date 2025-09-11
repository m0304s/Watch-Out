package watch.out.area.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AreaRequest(
    @NotBlank(message = "구역명은 필수입니다")
    @Size(max = 50, message = "구역명은 50자를 초과할 수 없습니다")
    String areaName,

    @Size(max = 50, message = "구역 별칭은 50자를 초과할 수 없습니다")
    String areaAlias,

    @NotNull(message = "구역 관리자 UUID는 필수입니다")
    UUID managerUuid
) {

}
