package watch.out.company.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import lombok.RequiredArgsConstructor;
import watch.out.company.dto.response.CompanyListResponse;
import watch.out.company.entity.QCompany;

@RequiredArgsConstructor
public class CompanyRepositoryCustomImpl implements CompanyRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<CompanyListResponse> findCompaniesAsDto() {
        QCompany company = QCompany.company;

        return queryFactory
            .select(Projections.constructor(CompanyListResponse.class,
                company.uuid,
                company.companyName))
            .from(company)
            .orderBy(company.companyName.asc())
            .fetch();
    }
}
