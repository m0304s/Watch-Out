package watch.out.safety.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.safety.entity.SafetyViolationDetail;

@Repository
public interface SafetyViolationDetailRepository extends
    JpaRepository<SafetyViolationDetail, UUID>, SafetyViolationDetailRepositoryCustom {

}
