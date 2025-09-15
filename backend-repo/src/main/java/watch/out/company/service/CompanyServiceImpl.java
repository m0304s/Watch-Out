package watch.out.company.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.company.dto.response.CompanyListResponse;
import watch.out.company.repository.CompanyRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Override
    public List<CompanyListResponse> getCompanies() {
        return companyRepository.findCompaniesAsDto();
    }
}
