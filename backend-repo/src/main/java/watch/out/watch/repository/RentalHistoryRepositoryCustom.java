package watch.out.watch.repository;

import java.util.Optional;
import java.util.UUID;

public interface RentalHistoryRepositoryCustom {

    Optional<Integer> findWatchIdByUserUuid(UUID userUuid);
}
