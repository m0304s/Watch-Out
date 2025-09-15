package watch.out.cctv.dto.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import watch.out.cctv.entity.Type;

public record UpdateCctvRequest(

    @Size(min = 1, max = 50, message = "cctvName은 1~50자여야 합니다")
    String cctvName,

    @NotBlank(message = "CCTV URL은 필수입니다")
    @Size(max = 100, message = "cctvUrl은 100자 이하여야 합니다")
    String cctvUrl,

    @NotNull
    Boolean isOnline,

    @NotNull
    Type type,

    @NotNull
    UUID areaUuid
) {

}
