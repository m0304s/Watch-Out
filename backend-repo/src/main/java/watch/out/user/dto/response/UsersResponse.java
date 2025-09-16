package watch.out.user.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.common.util.S3Util;
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

    public static UsersResponse from(UsersDto usersDto, S3Util s3Util) {
        String photoUrl = s3Util.keyToUrl(usersDto.photoKey());

        return new UsersResponse(
            usersDto.userUuid(),
            usersDto.userId(),
            usersDto.userName(),
            usersDto.companyName(),
            usersDto.areaName(),
            usersDto.trainingStatus(),
            usersDto.lastEntryTime(),
            usersDto.userRole(),
            photoUrl
        );
    }
}
