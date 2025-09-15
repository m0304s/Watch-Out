package watch.out.cctv.repository;

import watch.out.cctv.dto.response.CctvResponse;

import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;

public interface CctvRepositoryCustom {


	List<CctvResponse> findCctvsAsDto(UUID areaUuid, Boolean isOnline, String cctvName,
		PageRequest pageRequest);

	long countCctv(UUID areaUuid, Boolean isOnline, String cctvName);
}
