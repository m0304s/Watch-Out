package watch.out.notification.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.notification.dto.request.FcmTokenRequest;
import watch.out.notification.dto.request.TestSafetyViolationRequest;
import watch.out.notification.dto.request.TestHeavyEquipmentRequest;
import watch.out.notification.dto.request.TestFaceRecognitionRequest;
import watch.out.notification.dto.response.FcmTokenResponse;
import watch.out.notification.entity.FcmToken;
import watch.out.notification.service.FcmService;
import watch.out.notification.service.FcmTokenService;
import watch.out.user.service.UserService;
import watch.out.area.listener.EntryExitEventListener;
import watch.out.cctv.dto.request.EntryExitEventRequest;

@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
@Tag(name = "FCM 알림", description = "FCM 토큰 관리 및 알림 테스트 API")
public class FcmController {

    private final FcmTokenService fcmTokenService;
    private final FcmService fcmService;
    private final EntryExitEventListener entryExitEventListener;

    /**
     * FCM 토큰 등록
     */
    @PostMapping("/token")
    public ResponseEntity<FcmTokenResponse> registerToken(
        @Valid @RequestBody FcmTokenRequest fcmTokenRequest) {
        FcmToken fcmToken = fcmTokenService.registerToken(fcmTokenRequest);
        return ResponseEntity.ok(FcmTokenResponse.from(fcmToken));
    }

    /**
     * FCM 토큰 삭제
     */
    @PostMapping("/token/remove")
    public ResponseEntity<Void> removeToken(@Valid @RequestBody FcmTokenRequest fcmTokenRequest) {
        fcmTokenService.removeToken(fcmTokenRequest.token());
        return ResponseEntity.noContent().build();
    }

    /**
     * 내 FCM 토큰 목록 조회
     */
    @GetMapping("/tokens")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN', 'USER')")
    public ResponseEntity<FcmTokenResponse> getMyTokens() {
        FcmTokenResponse fcmTokenResponse = fcmTokenService.getMyTokens();
        return ResponseEntity.ok(fcmTokenResponse);
    }

    /**
     * 테스트용 안전장비 위반 알림 전송
     */
    @PostMapping("/test/safety-violation")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<String> testSafetyViolationNotification(
        @Valid @RequestBody TestSafetyViolationRequest request) {
        try {
            fcmService.sendTestSafetyViolationNotification(
                request.areaUuid(),
                request.areaName(),
                request.cctvName(),
                request.violationTypes(),
                request.violationUuid()
            );
            
            return ResponseEntity.ok("안전장비 위반 알림 테스트 전송 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("알림 전송 실패: " + e.getMessage());
        }
    }

    /**
     * 테스트용 중장비 진입 알림 전송
     */
    @PostMapping("/test/heavy-equipment")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<String> testHeavyEquipmentNotification(
        @Valid @RequestBody TestHeavyEquipmentRequest request) {
        try {
            fcmService.sendTestHeavyEquipmentEntryNotification(
                request.areaUuid(),
                request.areaName(),
                request.cctvName(),
                request.heavyEquipmentTypes()
            );
            
            return ResponseEntity.ok("중장비 진입 알림 테스트 전송 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("알림 전송 실패: " + e.getMessage());
        }
    }

    /**
     * 테스트용 안면인식 성공 알림 전송 (출입 알림) - 실제 출입 이벤트 처리 로직 사용
     */
    @PostMapping("/test/face-recognition")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<String> testFaceRecognitionNotification(
        @Valid @RequestBody TestFaceRecognitionRequest request) {
        try {
            // 실제 출입 이벤트 처리 로직 사용 (DB 저장 + FCM 알림)
            EntryExitEventRequest eventRequest = new EntryExitEventRequest(
                request.userUuid().toString(),
                request.areaUuid().toString(),
                request.entryType(),
                request.timestamp()
            );
            
            // 실제 출입 이벤트 리스너 로직 호출 (DB 저장 + FCM 알림)
            entryExitEventListener.consumeAccessEvent(eventRequest, null);
            
            return ResponseEntity.ok("안면인식 성공 알림 테스트 전송 완료 (실제 출입 이벤트 처리 로직 사용)");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("알림 전송 실패: " + e.getMessage());
        }
    }
}
