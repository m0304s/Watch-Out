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
    Integer watchNumber,
    String photoUrl,
    LocalDateTime assignedAt
) {

    public static UserResponse from(User user, Optional<Integer> watchNumber) {
        String companyName =
            (user.getCompany() != null) ? user.getCompany().getCompanyName() : null;
        String areaName = (user.getArea() != null) ? user.getArea().getAreaName() : null;
        String photoUrl = user.getPhotoKey(); // S3 생성 후 수정 필요

        return new UserResponse(
            user.getUuid(),
            user.getUserId(),
            user.getUserName(),
            companyName,
            areaName,
            user.getContact(),
            user.getEmergencyContact(),
            user.getGender(),
            user.getBloodType(),
            user.getRhFactor(),
            user.getTrainingStatus(),
            user.getTrainingCompletedAt(),
            user.getRole(),
            watchNumber.orElse(null),
            photoUrl,
            user.getAssignedAt()
        );
    }
}
