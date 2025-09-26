package watch.out.watch.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import watch.out.watch.entity.WatchStatus;

public record UpdateWatchRequest(
    @Size(max = 50, message = "모델명은 50자를 초과할 수 없습니다.")
    String modelName,

    @NotNull(message = "상태는 필수입니다.")
    WatchStatus status,

    @Size(max = 50, message = "비고는 50자를 초과할 수 없습니다.")
    String note
) {

}
