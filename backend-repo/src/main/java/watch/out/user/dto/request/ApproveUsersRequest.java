package watch.out.user.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record ApproveUsersRequest(
    @NotEmpty
    List<UUID> userUuids
) {

}
