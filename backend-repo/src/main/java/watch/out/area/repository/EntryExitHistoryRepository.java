package watch.out.area.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.area.entity.EntryExitHistory;
import java.util.UUID;

public interface EntryExitHistoryRepository extends JpaRepository<EntryExitHistory, UUID> {

}