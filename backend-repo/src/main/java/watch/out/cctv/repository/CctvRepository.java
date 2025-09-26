package watch.out.cctv.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.cctv.entity.Cctv;

import java.util.Optional;
import java.util.UUID;
import watch.out.cctv.entity.Type;

public interface CctvRepository extends JpaRepository<Cctv, UUID>, CctvRepositoryCustom {

    /**
     * CCTV 이름으로 CCTV 조회
     *
     * @param cctvName CCTV 이름
     * @return CCTV 엔티티 (Optional)
     */
    Optional<Cctv> findByCctvName(String cctvName);

    List<Cctv> findByType(Type type);

    List<Cctv> findByAreaUuidAndType(UUID areaUuid, Type type);

    Optional<Cctv> findByUuidAndType(UUID uuid, Type type);
}
