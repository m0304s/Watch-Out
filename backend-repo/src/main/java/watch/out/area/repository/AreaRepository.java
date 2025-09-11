package watch.out.area.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.area.entity.Area;

<<<<<<< HEAD
public interface AreaRepository extends JpaRepository<Area, UUID> {
=======
public interface AreaRepository extends JpaRepository<Area, UUID>, AreaRepositoryCustom {

>>>>>>> 4ae8413d0e06788bb67b5f0ea64e7cfc65dc2023
}
