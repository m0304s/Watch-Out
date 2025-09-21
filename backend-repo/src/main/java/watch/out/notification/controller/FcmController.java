package watch.out.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.notification.dto.request.SimpleFaceRecognitionTestRequest;
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
    private final FcmService fcmService;
    private final UserService userService;

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
     * 간단한 안면인식 성공 FCM 알림 테스트 (JWT 토큰 기반)
     */
    @PostMapping("/test/face-recognition/simple")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN', 'WORKER')")
    @Operation(
        summary = "간단한 안면인식 성공 FCM 알림 테스트",
        description = "JWT 토큰에서 사용자 정보를 추출하여 안면인식 성공 시나리오를 테스트합니다. " +
            "출입/퇴실 타입만 입력하면 해당 사용자와 구역 관리자들에게 data-only 방식의 FCM 알림을 전송합니다."
    )
    public ResponseEntity<String> testSimpleFaceRecognitionNotification(
        @Valid @RequestBody SimpleFaceRecognitionTestRequest request) {

        try {
            // JWT에서 현재 사용자 UUID 추출
            UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_ACCESS_TOKEN));

            // 사용자 정보와 구역 정보 조회
            UserWithAreaDto userWithArea = userService.getUserWithArea(currentUserUuid);

            // 구역이 배정되지 않은 경우 예외 처리
            if (userWithArea.areaUuid() == null) {
                return ResponseEntity.badRequest()
                    .body("구역이 배정되지 않은 사용자입니다. 관리자에게 문의하세요.");
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            fcmService.sendFaceRecognitionSuccessNotification(
                userWithArea.userUuid(),
                userWithArea.areaUuid(),
                userWithArea.userName(),
                userWithArea.areaName(),
                request.entryType(),
                timestamp
            );

            return ResponseEntity.ok(String.format(
                "안면인식 성공 FCM 알림 테스트 전송 완료: 사용자=%s, 구역=%s, 타입=%s",
                userWithArea.userName(), userWithArea.areaName(), request.entryType()
            ));

        } catch (BusinessException e) {
            return ResponseEntity.badRequest()
                .body("테스트 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("FCM 알림 테스트 전송 실패: " + e.getMessage());
        }
    }
}
