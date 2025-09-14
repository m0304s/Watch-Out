package watch.out.user.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record AssignAreaRequest(
    @NotEmpty()
    List<UUID> userUuids,

    @NotNull()
    UUID areaUuid
) {

}
