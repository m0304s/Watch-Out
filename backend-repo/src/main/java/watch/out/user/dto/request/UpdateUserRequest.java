package watch.out.user.dto.request;

import jakarta.validation.constraints.Size;
import java.util.UUID;
import watch.out.user.entity.BloodType;
import watch.out.user.entity.RhFactor;

public record UpdateUserRequest(

    @Size(max = 20)
    String userName,

    @Size(max = 11)
    String contact,

    @Size(max = 11)
    String emergencyContact,

    BloodType bloodType,

    RhFactor rhFactor,

    @Size(max = 100)
    String photoUrl,

    UUID companyUuid
) {

}
