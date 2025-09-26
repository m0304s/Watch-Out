package watch.out.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import watch.out.company.entity.Company;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.Gender;
import watch.out.user.entity.RhFactor;
import watch.out.user.entity.User;

public record SignupRequest(
    @NotBlank
    @Size(min = 7, max = 7)
    String userId,

    @NotBlank
    @Size(min = 8, max = 16)
    String password,

    @NotBlank
    @Size(max = 20)
    String userName,

    @NotBlank
    @Size(max = 11)
    String contact,

    @NotBlank
    @Size(max = 11)
    String emergencyContact,

    @NotNull
    BloodType bloodType,

    @NotNull
    RhFactor rhFactor,

    Gender gender,

    @Size(max = 100)
    String photoUrl,

    @NotNull
    UUID companyUuid
) {

    public User toEntity(String encodedPassword, Company company, String photoKey) {
        return User.builder()
            .userId(userId)
            .password(encodedPassword)
            .userName(userName)
            .contact(contact)
            .emergencyContact(emergencyContact)
            .gender(gender)
            .bloodType(bloodType)
            .rhFactor(rhFactor)
            .photoKey(photoKey)
            .company(company)
            .build();
    }
}
