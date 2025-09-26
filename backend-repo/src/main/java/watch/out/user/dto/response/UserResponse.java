package watch.out.user.dto.response;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import watch.out.common.util.S3Util;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.Gender;
import watch.out.user.entity.RhFactor;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;

public record UserResponse(
    UUID userUuid,
    String userId,
    String userName,
    String companyName,
    String areaName,
    String contact,
    String emergencyContact,
    Gender gender,
    BloodType bloodType,
    RhFactor rhFactor,
    TrainingStatus trainingStatus,
    LocalDateTime trainingCompletedAt,
    UserRole userRole,
    Integer watchId,
    String photoUrl,
    LocalDateTime assignedAt
) {

    public static UserResponse from(UserDto userDto, S3Util s3Util) {
        String photoUrl = s3Util.keyToUrl(userDto.photoKey());

        return new UserResponse(
            userDto.userUuid(),
            userDto.userId(),
            userDto.userName(),
            userDto.companyName(),
            userDto.areaName(),
            userDto.contact(),
            userDto.emergencyContact(),
            userDto.gender(),
            userDto.bloodType(),
            userDto.rhFactor(),
            userDto.trainingStatus(),
            userDto.trainingCompletedAt(),
            userDto.userRole(),
            userDto.watchId(),
            photoUrl,
            userDto.assignedAt()
        );
    }
}
