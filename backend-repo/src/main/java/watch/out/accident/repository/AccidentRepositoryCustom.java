package watch.out.accident.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
     * 특정 날짜의 사고 발생 횟수를 조회
     *
     * @param date 조회 날짜
     * @return 사고 발생 횟수
     */
    long countAccidentsByDate(LocalDate date);

    /**
     * 특정 구역의 특정 날짜 사고 발생 횟수를 조회
     *
     * @param areaUuid 구역 UUID
     * @param date     조회 날짜
     * @return 사고 발생 횟수
     */
    long countAccidentsByAreaAndDate(UUID areaUuid, LocalDate date);

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

    /**
     * 여러 구역의 특정 날짜 사고 발생 횟수를 한 번에 조회
     *
     * @param areaUuids 구역 UUID 리스트
     * @param date      조회 날짜
     * @return 구역별 사고 발생 횟수 (Map<areaUuid, count>)
     */
    Map<UUID, Long> countAccidentsByAreasAndDate(List<UUID> areaUuids, LocalDate date);

    /**
     * 특정 시간 범위의 사고 발생 횟수를 조회 (시간별 통계용)
     *
     * @param areaUuids 구역 UUID 리스트 (null이면 모든 구역)
     * @param startTime 시작 시간
     * @param endTime   종료 시간
     * @return 사고 발생 횟수
     */
    long countAccidentsByTimeRange(List<UUID> areaUuids, LocalDateTime startTime,
        LocalDateTime endTime);

    /**
     * 지난 7일간의 사고 발생 횟수를 조회
     *
     * @param areaUuids 구역 UUID 리스트 (null이면 모든 구역)
     * @return 사고 발생 횟수
     */
    long countAccidentsLast7Days(List<UUID> areaUuids);


    /**
     * 시간별 사고 발생 통계를 단일 쿼리로 조회 (최고 성능)
     *
     * @param areaUuids 구역 UUID 리스트 (null이면 모든 구역)
     * @param startTime 전체 조회 시작 시간
     * @param endTime   전체 조회 종료 시간
     * @return 시간대별 사고 발생 횟수 (Map<시간대인덱스, 건수>)
     */
    Map<Integer, Long> getHourlyAccidentStatsOptimized(List<UUID> areaUuids,
        LocalDateTime startTime, LocalDateTime endTime);

}

