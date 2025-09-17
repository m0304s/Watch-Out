package watch.out.safety.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.area.service.AreaAccessService;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.repository.CctvRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.common.util.S3Util;
import watch.out.dashboard.dto.response.SafetyViolationStatusResponse;
import watch.out.dashboard.dto.response.ViolationTypeStatistics;
import watch.out.safety.dto.response.SafetyViolationResponse;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationDetail;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.safety.repository.SafetyViolationDetailRepository;
import watch.out.safety.repository.SafetyViolationRepository;
import watch.out.user.entity.UserRole;

@Service
@RequiredArgsConstructor
@Transactional
public class SafetyViolationServiceImpl implements SafetyViolationService {

    private final SafetyViolationRepository safetyViolationRepository;
    private final SafetyViolationDetailRepository safetyViolationDetailRepository;
    private final CctvRepository cctvRepository;
    private final AreaRepository areaRepository;
    private final AreaAccessService areaAccessService;
    private final ObjectMapper objectMapper;
    private final S3Util s3Util;

    @Override
    public SafetyViolation saveViolation(UUID cctvUuid, UUID areaUuid,
        List<SafetyViolationType> violationTypes, String snapshotUrl) {
        // CCTV 엔티티 조회
        Cctv cctv = cctvRepository.findById(cctvUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // Area 엔티티 조회
        Area area = areaRepository.findById(areaUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // S3 URL을 키로 변환
        String imageKey = s3Util.urlToKey(snapshotUrl);
        if (imageKey == null) {
            throw new BusinessException(ErrorCode.INVALID_FILE_NAME);
        }

        // SafetyViolation 엔티티 생성 및 저장
        SafetyViolation safetyViolation = SafetyViolation.builder()
            .imageKey(imageKey)
            .cctv(cctv)
            .area(area)
            .build();

        SafetyViolation savedViolation = safetyViolationRepository.save(safetyViolation);

        // SafetyViolationDetail 엔티티들 생성 및 저장
        List<SafetyViolationDetail> violationDetails = new ArrayList<>();
        for (SafetyViolationType violationType : violationTypes) {
            SafetyViolationDetail detail = SafetyViolationDetail.builder()
                .safetyViolation(savedViolation)
                .violationType(violationType)
                .build();
            violationDetails.add(detail);
        }

        safetyViolationDetailRepository.saveAll(violationDetails);

        return savedViolation;
    }

    @Override
    @Transactional(readOnly = true)
    public SafetyViolationStatusResponse getSafetyViolationStatus(List<UUID> areaUuids) {
        LocalDate today = LocalDate.now();

        // 구역 목록 조회 및 유효성 검사
        List<Area> areas = areaAccessService.getAccessibleAreas(areaUuids);
        areaAccessService.validateAreas(areaUuids, areas);

        // 구역 UUID 리스트 추출
        List<UUID> foundAreaUuids = areas.stream()
            .map(Area::getUuid)
            .toList();

        // 개별 위반 유형별 통계 조회 (QueryDSL 통합)
        Map<String, Long> violationTypeCounts = safetyViolationRepository.getViolationTypeStatisticsByAreas(
            foundAreaUuids, today);

        // 위반 유형별 통계 계산
        List<ViolationTypeStatistics> violationTypeStats = calculateViolationTypeStatistics(
            violationTypeCounts);

        return new SafetyViolationStatusResponse(violationTypeStats);
    }


    /**
     * 위반 유형별 통계 계산 (QueryDSL 통합 결과 사용)
     */
    private List<ViolationTypeStatistics> calculateViolationTypeStatistics(
        Map<String, Long> violationTypeCounts) {
        return violationTypeCounts.entrySet().stream()
            .map(entry -> {
                SafetyViolationType violationType = SafetyViolationType.valueOf(entry.getKey());
                Long count = entry.getValue();

                return new ViolationTypeStatistics(
                    violationType.name(),
                    violationType.getDescription(),
                    count.intValue()
                );
            })
            .sorted((a, b) -> Integer.compare(b.count(), a.count())) // 건수 내림차순 정렬
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SafetyViolationResponse> getViolationsByType(List<UUID> areaUuids,
        SafetyViolationType violationType) {
        LocalDate today = LocalDate.now();

        // 구역 목록 조회 및 유효성 검사
        List<Area> areas = areaAccessService.getAccessibleAreas(areaUuids);
        areaAccessService.validateAreas(areaUuids, areas);

        // 구역 UUID 리스트 추출
        List<UUID> foundAreaUuids = areas.stream()
            .map(Area::getUuid)
            .toList();

        // 특정 위반 유형을 포함한 위반 내역 조회
        List<SafetyViolation> violations = safetyViolationDetailRepository.findViolationsByAreaAndViolationType(
            foundAreaUuids,
            violationType,
            today.atStartOfDay(),
            today.atTime(23, 59, 59)
        );

        // SafetyViolation 엔티티를 SafetyViolationResponse DTO로 변환
        return violations.stream()
            .map(violation -> SafetyViolationResponse.from(violation, s3Util))
            .toList();
    }

}
