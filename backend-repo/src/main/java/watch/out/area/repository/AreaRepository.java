package watch.out.area.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.area.entity.Area;

public interface AreaRepository extends JpaRepository<Area, UUID>, AreaRepositoryCustom {

}
