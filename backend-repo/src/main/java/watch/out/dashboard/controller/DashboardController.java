package watch.out.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.dashboard.dto.request.SafetyScoreRequest;
import watch.out.dashboard.dto.response.SafetyScoreResponse;
import watch.out.dashboard.service.SafetyScoreService;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SafetyScoreService safetyScoreService;

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
}
