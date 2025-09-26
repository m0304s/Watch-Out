package watch.out.user.dto.response;

import java.util.UUID;
import watch.out.user.entity.UserRole;

public record UserRoleUpdateResponse(
    UUID userUuid,
    String userId,
    String userName,
    UserRole newRole
) {

    public static UserRoleUpdateResponse of(UUID userUuid, String userId, String userName,
        UserRole newRole) {
        return new UserRoleUpdateResponse(
            userUuid,
            userId,
            userName,
            newRole
        );
    }
}
