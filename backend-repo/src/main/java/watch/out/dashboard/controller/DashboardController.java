package watch.out.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import watch.out.dashboard.dto.request.AccidentStatusRequest;
import watch.out.dashboard.dto.request.SafetyScoreRequest;
import watch.out.dashboard.dto.request.SafetyViolationStatusRequest;
import watch.out.dashboard.dto.response.AccidentStatusResponse;
import watch.out.dashboard.dto.response.SafetyScoreResponse;
import watch.out.dashboard.dto.response.SafetyViolationStatusResponse;
import watch.out.dashboard.dto.response.SafetyViolationWeeklyResponse;
import watch.out.dashboard.dto.response.ViolationTypeStatisticsWeekly;
import watch.out.dashboard.service.AccidentStatusService;
import watch.out.dashboard.service.SafetyScoreService;
import java.util.List;
import java.util.UUID;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.safety.service.SafetyViolationService;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SafetyScoreService safetyScoreService;
    private final SafetyViolationService safetyViolationService;
    private final AccidentStatusService accidentStatusService;

    /**
     * 구역 UUID 리스트에 해당하는 오늘 날짜 안전지수 평균을 조회 areaUuids가 없으면 모든 구역의 안전지수 평균을 조회
     *
     * @param request 안전지수 조회 요청 (areaUuids)
     * @return 안전지수 평균 (단일 정수값)
     */
    @PostMapping("/safety-scores")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<SafetyScoreResponse> getSafetyScores(
        @RequestBody SafetyScoreRequest safetyScoreRequest) {
        SafetyScoreResponse safetyScoreResponse = safetyScoreService.getSafetyScores(
            safetyScoreRequest.areaUuids());
        return ResponseEntity.ok(safetyScoreResponse);
    }

    /**
     * 오늘 안전장비 미착용 현황을 조회
     *
     * @param request 안전장비 미착용 현황 조회 요청
     * @return 안전장비 미착용 현황
     */
    @PostMapping("/safety-violation-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<SafetyViolationStatusResponse> getSafetyViolationStatus(
        @RequestBody SafetyViolationStatusRequest safetyViolationStatusRequest) {
        SafetyViolationStatusResponse safetyViolationStatusResponse = safetyViolationService.getSafetyViolationStatus(
            safetyViolationStatusRequest.areaUuids());
        return ResponseEntity.ok(safetyViolationStatusResponse);
    }

    /**
     * 사고 발생 현황을 조회
     *
     * @param request 사고 발생 현황 조회 요청 (areaUuids)
     * @return 사고 발생 현황 (오늘 현재, 지난 7일, 시간별 추이)
     */
    @PostMapping("/accident-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<AccidentStatusResponse> getAccidentStatus(
        @RequestBody AccidentStatusRequest accidentStatusRequest) {
        AccidentStatusResponse accidentStatusResponse = accidentStatusService.getAccidentStatus(
            accidentStatusRequest);
        return ResponseEntity.ok(accidentStatusResponse);
    }

    @PostMapping("/safety-violation-weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<SafetyViolationWeeklyResponse> getSafetyViolationWeekly(
        @RequestBody SafetyViolationStatusRequest safetyViolationStatusRequest) {
        List<ViolationTypeStatisticsWeekly> dailyViolationTypeStatisticsList =
            safetyViolationService.getSafetyViolationWeekly(
                safetyViolationStatusRequest.areaUuids());
        return ResponseEntity.ok(
            new SafetyViolationWeeklyResponse(dailyViolationTypeStatisticsList));
    }
}
