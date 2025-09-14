package watch.out.accident.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.accident.entity.Accident;

public interface AccidentRepository extends JpaRepository<Accident, UUID>,
    AccidentRepositoryCustom {

}
