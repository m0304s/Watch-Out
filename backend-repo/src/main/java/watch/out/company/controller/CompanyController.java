package watch.out.company.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.company.dto.response.CompanyListResponse;
import watch.out.company.service.CompanyService;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyListResponse>> getCompanies() {
        List<CompanyListResponse> companiesResponse = companyService.getCompanies();
        return ResponseEntity.ok(companiesResponse);
    }
}
