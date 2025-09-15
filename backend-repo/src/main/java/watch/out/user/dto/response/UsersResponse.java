package watch.out.user.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.UserRole;

public record UsersResponse(
    UUID userUuid,
    String userId,
    String userName,
    String companyName,
    String areaName,
    TrainingStatus trainingStatus,
    LocalDateTime lastEntryTime,
    UserRole userRole,
    String photoUrl
) {

}
