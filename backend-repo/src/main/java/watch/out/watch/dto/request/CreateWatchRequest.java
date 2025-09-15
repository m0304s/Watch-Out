package watch.out.watch.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import watch.out.watch.entity.Watch;

public record CreateWatchRequest(
    @NotBlank(message = "모델명은 필수입니다.")
    @Size(max = 50, message = "모델명은 50자를 초과할 수 없습니다.")
    String modelName,

    @Size(max = 50, message = "비고는 50자를 초과할 수 없습니다.")
    String note
) {

    public Watch toEntity() {
        return Watch.builder()
            .modelName(this.modelName)
            .note(this.note)
            .build();
    }
}
