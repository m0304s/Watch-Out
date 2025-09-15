package watch.out.watch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.watch.entity.Watch;

import java.util.UUID;

public interface WatchRepository extends JpaRepository<Watch, UUID>, WatchRepositoryCustom {

}
