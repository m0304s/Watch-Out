package watch.out.user.dto.response;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.Gender;
import watch.out.user.entity.RhFactor;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;

public record UserDto(
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
    String photoKey,
    LocalDateTime assignedAt
) {

    public UserDto(User user, Integer watchId) {
        this(
            user.getUuid(),
            user.getUserId(),
            user.getUserName(),
            (user.getCompany() != null) ? user.getCompany().getCompanyName() : null,
            (user.getArea() != null) ? user.getArea().getAreaName() : null,
            user.getContact(),
            user.getEmergencyContact(),
            user.getGender(),
            user.getBloodType(),
            user.getRhFactor(),
            user.getTrainingStatus(),
            user.getTrainingCompletedAt(),
            user.getRole(),
            watchId,
            user.getPhotoKey(),
            user.getAssignedAt()
        );
    }
}
