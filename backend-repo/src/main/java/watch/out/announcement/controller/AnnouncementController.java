package watch.out.announcement.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import watch.out.announcement.dto.request.AnnouncementRequest;
import watch.out.announcement.dto.response.AnnouncementResponse;
import watch.out.announcement.service.AnnouncementService;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    /**
     * 여러 구역의 작업자들에게 공지사항 전송
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<List<AnnouncementResponse>> sendAnnouncementToAreas(
        @Valid @RequestBody AnnouncementRequest announcementRequest) {
        List<AnnouncementResponse> announcementResponses = announcementService.sendAnnouncementToAreas(announcementRequest);
        return ResponseEntity.ok(announcementResponses);
    }

    /**
     * 현재 사용자의 공지사항 목록 조회
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN', 'WORKER')")
    public ResponseEntity<List<AnnouncementResponse>> getMyAnnouncements() {
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_ACCESS_TOKEN));
        List<AnnouncementResponse> announcementResponses = announcementService.getAnnouncementsByUser(
            currentUserUuid);
        return ResponseEntity.ok(announcementResponses);
    }

    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{announcementUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<AnnouncementResponse> getAnnouncementDetail(
        @PathVariable UUID announcementUuid) {
        AnnouncementResponse announcementResponse = announcementService.getAnnouncementDetail(announcementUuid);
        return ResponseEntity.ok(announcementResponse);
    }

}
