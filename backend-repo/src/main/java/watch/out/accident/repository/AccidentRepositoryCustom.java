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
     * 특정 구역의 사고 목록을 조회
     *
     * @param areaUuid 구역 UUID
     * @return 사고 목록 DTO
     */
    List<AccidentDetailResponse> findAccidentsByArea(UUID areaUuid);

    /**
     * 특정 사고 유형의 사고 목록을 조회
     *
     * @param accidentType 사고 유형
     * @return 사고 목록 DTO
     */
    List<AccidentDetailResponse> findAccidentsByType(AccidentType accidentType);

    /**
     * 특정 사용자의 사고 목록을 조회
     *
     * @param userUuid 사용자 UUID
     * @return 사고 목록 DTO
     */
    List<AccidentDetailResponse> findAccidentsByUser(UUID userUuid);
}
