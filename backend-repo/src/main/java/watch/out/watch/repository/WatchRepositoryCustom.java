package watch.out.watch.repository;

import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.watch.dto.response.RentalHistoryResponse;
import watch.out.watch.dto.response.WatchListResponse;

import java.util.UUID;

public interface WatchRepositoryCustom {

    PageResponse<WatchListResponse> findWatches(PageRequest pageRequest);

    PageResponse<RentalHistoryResponse> findRentalHistoriesByWatchUuid(UUID watchUuid,
        PageRequest pageRequest);
}
