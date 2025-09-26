package watch.out.company.dto.response;

import java.util.UUID;

public record CompanyListResponse(
    UUID companyUuid,
    String companyName
) {

}
