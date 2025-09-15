package watch.out.cctv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.cctv.entity.Cctv;

import java.util.UUID;

public interface CctvRepository extends JpaRepository<Cctv, UUID>, CctvRepositoryCustom {

}
