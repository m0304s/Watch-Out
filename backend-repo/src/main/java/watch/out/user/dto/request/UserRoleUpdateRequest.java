package watch.out.user.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import watch.out.user.entity.UserRole;

public record UserRoleUpdateRequest(
    @NotNull(message = "사용자 UUID는 필수입니다")
    UUID userUuid,

    @NotNull(message = "변경할 권한은 필수입니다")
    UserRole newRole
) {

}
