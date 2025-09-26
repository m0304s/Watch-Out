package watch.out.safety.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.safety.entity.SafetyViolation;

@Repository
public interface SafetyViolationRepository extends JpaRepository<SafetyViolation, UUID>,
    SafetyViolationRepositoryCustom {

}
