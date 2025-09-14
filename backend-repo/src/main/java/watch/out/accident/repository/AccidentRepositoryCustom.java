package watch.out.accident.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.entity.AccidentType;

public interface AccidentRepositoryCustom {

    /**
     * 사고 상세 정보를 조회
     *
     * @param accidentUuid 사고 UUID
     * @return 사고 정보 DTO
     */
    Optional<AccidentDetailResponse> findAccidentDetailById(UUID accidentUuid);

    /**
     * 다중 필터 조건으로 사고 목록을 조회
     *
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @return 사고 목록 DTO
     */
    List<AccidentDetailResponse> findAccidentsWithFilters(UUID areaUuid, AccidentType accidentType,
        UUID userUuid);
}
