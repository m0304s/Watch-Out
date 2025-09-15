package watch.out.cctv.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import watch.out.cctv.dto.response.CctvResponse;
import watch.out.cctv.entity.QCctv;
import watch.out.area.entity.QArea; // 실제 패키지

import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;

import static org.apache.commons.lang3.StringUtils.isBlank;

@RequiredArgsConstructor
public class CctvRepositoryCustomImpl implements CctvRepositoryCustom {

	private final JPAQueryFactory jpaQueryFactory;

	@Override
	public List<CctvResponse> findCctvsAsDto(UUID areaUuid, Boolean isOnline, String cctvName,
		PageRequest pageRequest) {
		QCctv cctv = QCctv.cctv;
		QArea area = QArea.area;

		BooleanBuilder where = new BooleanBuilder();
		if (areaUuid != null) {
			where.and(area.uuid.eq(areaUuid));
		}
		if (isOnline != null) {
			where.and(cctv.isOnline.eq(isOnline));
		}
		if (!isBlank(cctvName)) {
			where.and(cctv.cctvName.containsIgnoreCase(cctvName));
		}

		return jpaQueryFactory
			.select(Projections.constructor(
				CctvResponse.class,
				cctv.uuid,
				cctv.cctvName,
				cctv.cctvUrl,
				cctv.isOnline,
				cctv.type,
				area.uuid,
				area.areaName
			))
			.from(cctv)
			.leftJoin(cctv.area, area)
			.where(where)
			.orderBy(cctv.cctvName.asc())
			.offset(pageRequest.pageNum() * pageRequest.display())
			.limit(pageRequest.display())
			.fetch();
	}


	@Override
	public long countCctv(UUID areaUuid, Boolean isOnline, String cctvName) {
		QCctv cctv = QCctv.cctv;
		QArea area = QArea.area;

		BooleanBuilder where = new BooleanBuilder();
		if (areaUuid != null) {
			where.and(area.uuid.eq(areaUuid));
		}
		if (isOnline != null) {
			where.and(cctv.isOnline.eq(isOnline));
		}
		if (!isBlank(cctvName)) {
			where.and(cctv.cctvName.containsIgnoreCase(cctvName));
		}

		Long total = jpaQueryFactory
			.select(cctv.count())
			.from(cctv)
			.leftJoin(cctv.area, area)
			.where(where)
			.fetchOne();

		return total == null ? 0L : total;
	}
}
