package watch.out.accident.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.dto.response.AccidentListResponse;
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
    public ResponseEntity<AccidentDetailResponse> getAccidentDetail(
        @PathVariable UUID accidentUuid) {
        AccidentDetailResponse response = accidentService.getAccidentDetail(accidentUuid);
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
     * @return 페이지네이션된 사고 목록 (최신 순 정렬)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<PageResponse<AccidentListResponse>> getAccidentList(
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display,
        @RequestParam(required = false) UUID areaUuid,
        @RequestParam(required = false) AccidentType accidentType,
        @RequestParam(required = false) UUID userUuid) {

        PageRequest pageRequest = PageRequest.of(pageNum, display);
        PageResponse<AccidentListResponse> response = accidentService.getAccidentList(
            pageRequest, areaUuid, accidentType, userUuid);

        return ResponseEntity.ok(response);
    }
}
