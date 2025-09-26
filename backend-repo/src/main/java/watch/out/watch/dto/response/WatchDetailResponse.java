package watch.out.watch.dto.response;

import watch.out.common.dto.PageResponse;
import watch.out.watch.entity.Watch;
import watch.out.watch.entity.WatchStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record WatchDetailResponse(
    UUID watchUuid,
    Integer watchId,
    String modelName,
    WatchStatus status,
    LocalDateTime createdAt,
    String note,
    PageResponse<RentalHistoryResponse> history
) {

    public static WatchDetailResponse from(Watch watch,
        PageResponse<RentalHistoryResponse> history) {
        return new WatchDetailResponse(
            watch.getUuid(),
            watch.getWatchId(),
            watch.getModelName(),
            watch.getStatus(),
            watch.getCreatedAt(),
            watch.getNote(),
            history
        );
    }
}
