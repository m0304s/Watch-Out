package watch.out.watch.service;

import watch.out.common.dto.PageRequest;
import watch.out.watch.dto.request.CreateWatchRequest;
import watch.out.watch.dto.request.RentWatchRequest;
import watch.out.watch.dto.request.UpdateWatchRequest;
import watch.out.watch.dto.response.WatchDetailResponse;
import watch.out.watch.dto.response.WatchListResponse;
import watch.out.common.dto.PageResponse;

import java.util.UUID;

public interface WatchService {

    PageResponse<WatchListResponse> getWatches(PageRequest pageRequest);

    WatchDetailResponse getWatch(UUID watchUuid, PageRequest pageRequest);

    void createWatch(CreateWatchRequest createWatchRequest);

    void deleteWatch(UUID watchUuid);

    void updateWatch(UUID watchUuid, UpdateWatchRequest updateWatchRequest);

    void rentWatch(UUID watchUuid, RentWatchRequest rentWatchRequest);

    void returnWatch(UUID watchUuid);
}
