package watch.out.company.repository;

import java.util.List;
import watch.out.company.dto.response.CompanyListResponse;

public interface CompanyRepositoryCustom {

    List<CompanyListResponse> findCompaniesAsDto();
}
