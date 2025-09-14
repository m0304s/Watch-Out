package watch.out.accident.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.common.dto.PageRequest;

public interface AccidentRepositoryCustom {

    /**
     * 사고 상세 정보를 조회
     *
     * @param accidentUuid 사고 UUID
     * @return 사고 정보 DTO
     */
    Optional<AccidentResponse> findAccidentDetailById(UUID accidentUuid);

    /**
     * 다중 필터 조건으로 사고 목록을 조회
     *
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @return 사고 목록 DTO
     */
    List<AccidentResponse> findAccidentsWithFilters(UUID areaUuid, AccidentType accidentType,
        UUID userUuid);

    /**
     * 페이지네이션을 지원하는 사고 목록 조회
     *
     * @param pageRequest  페이지 요청 정보
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 사고 목록 DTO
     */
    List<AccidentsResponse> findAccidentList(PageRequest pageRequest, UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 사고 목록 조회 시 총 개수 조회
     *
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 총 사고 개수
     */
    long countAccidents(UUID areaUuid, AccidentType accidentType, UUID userUuid,
        LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 관리자가 관리하는 구역의 사고 목록 조회
     *
     * @param pageRequest  페이지 요청 정보
     * @param managerUuid  관리자 UUID
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 관리자가 관리하는 구역의 사고 목록
     */
    List<AccidentsResponse> findAccidentListForManager(PageRequest pageRequest, UUID managerUuid,
        UUID areaUuid, AccidentType accidentType, UUID userUuid, LocalDateTime startDate,
        LocalDateTime endDate);

    /**
     * 관리자가 관리하는 구역의 사고 개수 조회
     *
     * @param managerUuid  관리자 UUID
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 관리자가 관리하는 구역의 사고 개수
     */
    long countAccidentsForManager(UUID managerUuid, UUID areaUuid, AccidentType accidentType,
        UUID userUuid, LocalDateTime startDate, LocalDateTime endDate);

}
