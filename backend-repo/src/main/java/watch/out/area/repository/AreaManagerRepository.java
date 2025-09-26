package watch.out.area.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.area.entity.AreaManager;

public interface AreaManagerRepository extends JpaRepository<AreaManager, UUID> {

    List<AreaManager> findByAreaUuid(UUID areaUuid);

    List<AreaManager> findByUserUuid(UUID userUuid);

    Boolean existsByUserUuid(UUID userUuid);

    void deleteByUser_Uuid(UUID userUuid);

    long countByUserUuid(UUID userUuid);

    Optional<AreaManager> findByUser_Uuid(UUID userUuid);
}
