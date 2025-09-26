package watch.out.watch.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import java.time.LocalDateTime;
import java.util.UUID;

public record RentalHistoryResponse(
    UUID userUuid,
    String userId,
    String userName,
    LocalDateTime rentedAt,
    LocalDateTime returnedAt
) {

    @QueryProjection
    public RentalHistoryResponse(UUID userUuid, String userId, String userName,
        LocalDateTime rentedAt, LocalDateTime returnedAt) {
        this.userUuid = userUuid;
        this.userId = userId;
        this.userName = userName;
        this.rentedAt = rentedAt;
        this.returnedAt = returnedAt;
    }
}
