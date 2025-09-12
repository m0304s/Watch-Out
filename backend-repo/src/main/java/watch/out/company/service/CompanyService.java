package watch.out.company.service;

import java.util.List;
import watch.out.company.dto.response.CompanyListResponse;

public interface CompanyService {

    List<CompanyListResponse> getCompanies();
}
