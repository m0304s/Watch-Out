package watch.out.company.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.company.entity.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

}
