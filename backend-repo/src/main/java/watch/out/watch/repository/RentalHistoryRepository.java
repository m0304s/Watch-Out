package watch.out.watch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.watch.entity.RentalHistory;

import java.util.Optional;
import java.util.UUID;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, UUID> {

    // 가장 최근의 대여 기록을 찾기 위한 쿼리 (워치가 IN_USE 상태일 때)
    Optional<RentalHistory> findFirstByWatchUuidAndReturnedAtIsNullOrderByCreatedAtDesc(
        UUID watchUuid);
}
