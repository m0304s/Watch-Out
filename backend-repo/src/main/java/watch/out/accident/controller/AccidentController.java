package watch.out.accident.controller;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import watch.out.accident.dto.request.AccidentReportRequest;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.dto.response.AccidentReportResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.service.AccidentService;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;

@RestController
@RequestMapping("/accident")
@RequiredArgsConstructor
public class AccidentController {

    private final AccidentService accidentService;

    @GetMapping("/{accidentUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<AccidentResponse> getAccident(
        @PathVariable UUID accidentUuid) {
        AccidentResponse response = accidentService.getAccident(accidentUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * 사고 목록 조회 (최신 순 정렬)
     *
     * @param pageNum      페이지 번호 (기본값: 0)
     * @param display      페이지 크기 (기본값: 10, 최대: 100)
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항) - AUTO_SOS, MANUAL_SOS
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항) - yyyy-MM-dd 형식
     * @param endDate      종료 날짜 (선택사항) - yyyy-MM-dd 형식
     * @return 페이지네이션된 사고 목록 (최신 순 정렬)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<PageResponse<AccidentsResponse>> getAccidents(
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display,
        @RequestParam(required = false) UUID areaUuid,
        @RequestParam(required = false) AccidentType accidentType,
        @RequestParam(required = false) UUID userUuid,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDateTime endDate) {

        PageRequest pageRequest = PageRequest.of(pageNum, display);
        PageResponse<AccidentsResponse> response = accidentService.getAccidents(
            pageRequest, areaUuid, accidentType, userUuid, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    /**
     * 사고 신고
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN', 'WORKER')")
    public ResponseEntity<AccidentReportResponse> reportAccident(
        @Valid @RequestBody AccidentReportRequest request) {
        AccidentReportResponse response = accidentService.reportAccident(request);
        return ResponseEntity.ok(response);
    }
}
