package watch.out.watch.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import watch.out.watch.entity.WatchStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record WatchListResponse(
    UUID watchUuid,
    Integer watchId,
    String modelName,
    WatchStatus status,
    LocalDateTime rentedAt,
    String note,
    String userName
) {

    @QueryProjection
    public WatchListResponse(UUID watchUuid, Integer watchId, String modelName, WatchStatus status,
        LocalDateTime rentedAt, String note, String userName) {
        this.watchUuid = watchUuid;
        this.watchId = watchId;
        this.modelName = modelName;
        this.status = status;
        this.rentedAt = rentedAt;
        this.note = note;
        this.userName = userName;
    }
}
