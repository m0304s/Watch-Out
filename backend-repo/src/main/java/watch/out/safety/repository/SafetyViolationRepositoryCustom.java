package watch.out.safety.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import watch.out.common.dto.PageRequest;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

public interface SafetyViolationRepositoryCustom {

    /**
     * 다중 필터 조건으로 안전장비 위반 목록을 조회
     *
     * @param pageRequest   페이지 요청 정보
     * @param areaUuid      구역 UUID (선택사항)
     * @param violationType 위반 유형 (선택사항)
     * @param startDate     시작 날짜 (선택사항)
     * @param endDate       종료 날짜 (선택사항)
     * @return 안전장비 위반 목록
     */
    List<SafetyViolation> findViolationList(PageRequest pageRequest, UUID areaUuid,
        SafetyViolationType violationType, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 안전장비 위반 목록 조회 시 총 개수 조회
     *
     * @param areaUuid      구역 UUID (선택사항)
     * @param violationType 위반 유형 (선택사항)
     * @param startDate     시작 날짜 (선택사항)
     * @param endDate       종료 날짜 (선택사항)
     * @return 총 위반 개수
     */
    long countViolations(UUID areaUuid, SafetyViolationType violationType,
        LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 관리자가 관리하는 구역의 안전장비 위반 목록 조회
     *
     * @param pageRequest   페이지 요청 정보
     * @param managerUuid   관리자 UUID
     * @param areaUuid      구역 UUID (선택사항)
     * @param violationType 위반 유형 (선택사항)
     * @param startDate     시작 날짜 (선택사항)
     * @param endDate       종료 날짜 (선택사항)
     * @return 관리자가 관리하는 구역의 위반 목록
     */
    List<SafetyViolation> findViolationListForManager(PageRequest pageRequest, UUID managerUuid,
        UUID areaUuid, SafetyViolationType violationType, LocalDateTime startDate,
        LocalDateTime endDate);

    /**
     * 관리자가 관리하는 구역의 안전장비 위반 개수 조회
     *
     * @param managerUuid   관리자 UUID
     * @param areaUuid      구역 UUID (선택사항)
     * @param violationType 위반 유형 (선택사항)
     * @param startDate     시작 날짜 (선택사항)
     * @param endDate       종료 날짜 (선택사항)
     * @return 관리자가 관리하는 구역의 위반 개수
     */
    long countViolationsForManager(UUID managerUuid, UUID areaUuid,
        SafetyViolationType violationType, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 특정 구역의 특정 날짜 안전장비 위반 건수 조회
     *
     * @param areaUuid 구역 UUID
     * @param date     조회 날짜
     * @return 위반 발생 횟수
     */
    long countViolationsByAreaAndDate(UUID areaUuid, LocalDate date);


    /**
     * 특정 위반 유형별 통계 조회
     *
     * @param startDate 시작 날짜
     * @param endDate   종료 날짜
     * @return 위반 유형별 통계
     */
    List<Object[]> getViolationStatisticsByType(LocalDate startDate, LocalDate endDate);

    /**
     * 특정 구역의 위반 통계 조회
     *
     * @param areaUuid  구역 UUID
     * @param startDate 시작 날짜
     * @param endDate   종료 날짜
     * @return 구역별 위반 통계
     */
    List<Object[]> getViolationStatisticsByArea(UUID areaUuid, LocalDate startDate,
        LocalDate endDate);

    /**
     * 여러 구역의 특정 날짜 안전장비 위반 횟수를 한 번에 조회
     *
     * @param areaUuids 구역 UUID 리스트
     * @param date      조회 날짜
     * @return 구역별 위반 발생 횟수 (Map<areaUuid, count>)
     */
    Map<UUID, Long> countViolationsByAreasAndDate(List<UUID> areaUuids, LocalDate date);

    /**
     * 여러 구역의 특정 날짜 안전장비 위반 내역을 한 번에 조회 (구역별 그룹화)
     *
     * @param areaUuids 구역 UUID 리스트
     * @param date      조회 날짜
     * @return 구역별 위반 내역 리스트 (Map<areaUuid, List<SafetyViolation>>)
     */
    Map<UUID, List<SafetyViolation>> findViolationsByAreasAndDate(List<UUID> areaUuids,
        LocalDate date);

    /**
     * 여러 구역의 위반 유형별 통계를 한 번에 조회
     *
     * @param areaUuids 구역 UUID 리스트
     * @param date      조회 날짜
     * @return 위반 유형별 통계 (Map<violationType, count>)
     */
    Map<String, Long> getViolationTypeStatisticsByAreas(List<UUID> areaUuids, LocalDate date);

    /**
     * 특정 개별 위반 유형을 포함한 위반 내역 조회
     *
     * @param areaUuids               구역 UUID 리스트
     * @param date                    조회 날짜
     * @param individualViolationType 개별 위반 유형 (예: "HELMET_OFF")
     * @return 해당 개별 위반 유형을 포함한 위반 내역 리스트
     */
    List<SafetyViolation> findViolationsByIndividualType(List<UUID> areaUuids, LocalDate date,
        String individualViolationType);
}
