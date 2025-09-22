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
import watch.out.notification.dto.response.FcmTokenResponse;
import watch.out.notification.entity.FcmToken;
import watch.out.notification.service.FcmService;
import watch.out.notification.service.FcmTokenService;
import watch.out.user.service.UserService;

@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
@Tag(name = "FCM 알림", description = "FCM 토큰 관리 및 알림 테스트 API")
public class FcmController {

    private final FcmTokenService fcmTokenService;

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
}
