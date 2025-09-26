package watch.out.safety.controller;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.safety.dto.request.SafetyViolationsRequest;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.safety.dto.response.SafetyViolationResponse;
import watch.out.safety.service.SafetyViolationService;

@RestController
@RequestMapping("/violations")
@RequiredArgsConstructor
public class SafetyViolationController {

    private final SafetyViolationService safetyViolationService;

    /**
     * 안전장비 미착용 목록 조회
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<PageResponse<SafetyViolationResponse>> getViolationList(
        @RequestParam(defaultValue = "0") @Min(0) int pageNum,
        @RequestParam(defaultValue = "10") @Min(1) @Max(50) int display,
        @RequestParam(required = false) List<UUID> areaUuids,
        @RequestParam(required = false) SafetyViolationType violationType,
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate) {

        PageRequest pageRequest = PageRequest.of(pageNum, display);
        SafetyViolationsRequest safetyViolationsRequest = new SafetyViolationsRequest(
            areaUuids, violationType, startDate, endDate
        );

        PageResponse<SafetyViolationResponse> safetyViolationsResponse = safetyViolationService.getViolations(
            pageRequest, safetyViolationsRequest);
        return ResponseEntity.ok(safetyViolationsResponse);
    }

    /**
     * 안전장비 미착용 상세 조회
     */
    @GetMapping("/{violationUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<SafetyViolationResponse> getViolationDetail(
        @PathVariable UUID violationUuid) {
        SafetyViolationResponse safetyViolationResponse = safetyViolationService.getViolationDetail(
            violationUuid);
        return ResponseEntity.ok(safetyViolationResponse);
    }
}
