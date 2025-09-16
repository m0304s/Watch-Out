package watch.out.auth.dto.response;

import java.util.UUID;
import watch.out.user.entity.UserRole;

public record LoginResponse(
    String accessToken,
    UUID userUuid,
    String userId,
    String userName,
    UserRole userRole,
    UUID areaUuid,
    boolean isApproved
) {

}
