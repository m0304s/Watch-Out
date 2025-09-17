package watch.out.safety.service;

import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.dashboard.dto.response.SafetyViolationStatusResponse;
import watch.out.safety.dto.request.SafetyViolationsRequest;
import watch.out.safety.dto.response.SafetyViolationResponse;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;

public interface SafetyViolationService {

    /**
     * 안전장비 위반 내역을 저장
     *
     * @param cctvUuid       CCTV UUID
     * @param areaUuid       구역 UUID
     * @param violationTypes 위반 유형 리스트 (단일 또는 복합)
     * @param snapshotUrl    S3 스냅샷 URL (URL을 키로 변환하여 저장)
     * @return 저장된 안전장비 위반 내역
     */
    SafetyViolation saveViolation(UUID cctvUuid, UUID areaUuid,
        List<SafetyViolationType> violationTypes,
        String snapshotUrl);

    /**
     * 오늘 안전장비 미착용 현황을 조회
     *
     * @param areaUuids 구역 UUID 리스트 (null이거나 비어있으면 전체 구역)
     * @return 안전장비 미착용 현황
     */
    SafetyViolationStatusResponse getSafetyViolationStatus(List<UUID> areaUuids);

    /**
     * 특정 위반 유형을 포함한 위반 내역을 조회합니다.
     *
     * @param areaUuids     구역 UUID 리스트 (null이거나 비어있으면 전체 구역)
     * @param violationType 조회할 위반 유형 (예: HELMET_OFF)
     * @return 해당 위반 유형을 포함한 위반 내역 리스트 (이미지 URL 포함)
     */
    List<SafetyViolationResponse> getViolationsByType(List<UUID> areaUuids,
        SafetyViolationType violationType);

    /**
     * 안전장비 미착용 목록을 조회합니다.
     *
     * @param pageRequest 페이지네이션 정보
     * @param request 필터 조건
     * @return 안전장비 미착용 목록 (페이지네이션 포함)
     */
    PageResponse<SafetyViolationResponse> getViolations(
        PageRequest pageRequest, SafetyViolationsRequest request);

    /**
     * 안전장비 미착용 상세 정보를 조회합니다.
     *
     * @param violationUuid 위반 UUID
     * @return 안전장비 미착용 상세 정보
     */
    SafetyViolationResponse getViolationDetail(UUID violationUuid);
}
