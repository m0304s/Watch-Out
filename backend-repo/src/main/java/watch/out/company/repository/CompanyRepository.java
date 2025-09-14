package watch.out.company.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import watch.out.company.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, UUID>, CompanyRepositoryCustom {

}
