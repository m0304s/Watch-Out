package watch.out.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushFcmOptions;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import watch.out.area.entity.AreaManager;
import watch.out.area.repository.AreaManagerRepository;
import watch.out.notification.dto.FcmMessage;
import watch.out.notification.entity.FcmToken;
import watch.out.notification.repository.FcmTokenRepository;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmService {

    private final FirebaseMessaging firebaseMessaging;
    private final FcmTokenRepository fcmTokenRepository;
    private final AreaManagerRepository areaManagerRepository;
    private final UserRepository userRepository;

    /**
     * 구역별 담당자에게 안전장비 위반 알림 전송
     */
    public void sendSafetyViolationNotification(UUID areaUuid, String areaName, String cctvName,
        List<String> violationTypes, String imageUrl) {
        try {
            // 1. 해당 구역의 AREA_ADMIN 담당자들 조회
            List<AreaManager> areaManagers = areaManagerRepository.findByAreaUuid(areaUuid);
            List<UUID> areaManagerUuids = areaManagers.stream()
                .map(areaManager -> areaManager.getUser().getUuid())
                .toList();

            // 2. 전체 ADMIN 사용자들 조회
            List<User> adminUsers = userRepository.findByRoleInAndDeletedAtIsNull(
                List.of(UserRole.ADMIN, UserRole.AREA_ADMIN));
            List<UUID> adminUuids = adminUsers.stream()
                .map(User::getUuid)
                .toList();

            // 3. 모든 담당자 UUID 합치기 (중복 제거)
            List<UUID> allManagerUuids = List.of(areaManagerUuids, adminUuids)
                .stream()
                .flatMap(List::stream)
                .distinct()
                .toList();

            if (allManagerUuids.isEmpty()) {
                log.warn("구역 {}의 담당자나 ADMIN이 없습니다.", areaName);
                return;
            }

            // 4. 담당자들의 FCM 토큰 조회
            List<FcmToken> tokens = fcmTokenRepository.findByUserUuidIn(allManagerUuids);

            if (tokens.isEmpty()) {
                log.warn("구역 {} 담당자들의 FCM 토큰이 없습니다.", areaName);
                return;
            }

            String title = "안전장비 미착용 감지";
            String body = String.format("[%s] %s에서 %s 미착용이 감지되었습니다.",
                areaName, cctvName, String.join(", ", violationTypes));

            // 5. 담당자들에게 알림 전송
            sendNotification(tokens, title, body, areaName, cctvName, violationTypes, imageUrl);

            log.info("안전장비 위반 알림 전송 완료: area={}, cctv={}, areaManagers={}, admins={}, tokens={}",
                areaName, cctvName, areaManagerUuids.size(), adminUuids.size(), tokens.size());

        } catch (Exception e) {
            log.error("안전장비 위반 알림 전송 실패: area={}, cctv={}", areaName, cctvName, e);
        }
    }

    /**
     * FCM 알림 전송
     */
    private void sendNotification(List<FcmToken> tokens, String title, String body,
        String areaName, String cctvName, List<String> violationTypes, String imageUrl) {
        for (FcmToken token : tokens) {
            try {
                Message message = Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl)
                        .build())
                    .setWebpushConfig(WebpushConfig.builder()
                        .setFcmOptions(WebpushFcmOptions.builder()
                            .setLink("/dashboard")
                            .build())
                        .putData("areaName", areaName)
                        .putData("cctvName", cctvName)
                        .putData("violationTypes", String.join(",", violationTypes))
                        .putData("imageUrl", imageUrl)
                        .putData("type", "SAFETY_VIOLATION")
                        .build())
                    .putData("areaName", areaName)
                    .putData("cctvName", cctvName)
                    .putData("violationTypes", String.join(",", violationTypes))
                    .putData("imageUrl", imageUrl)
                    .putData("type", "SAFETY_VIOLATION")
                    .build();

                String response = firebaseMessaging.send(message);
                log.debug("FCM 알림 전송 성공: token={}, response={}", token.getFcmToken(), response);

            } catch (FirebaseMessagingException e) {
                log.error("FCM 알림 전송 실패: token={}", token.getFcmToken(), e);
                // 토큰이 유효하지 않은 경우 삭제
                if (e.getMessagingErrorCode() != null) {
                    fcmTokenRepository.delete(token);
                    log.info("유효하지 않은 FCM 토큰 삭제: {}", token.getFcmToken());
                }
            }
        }
    }

    /**
     * 특정 사용자에게 알림 전송
     */
    public void sendNotificationToUser(UUID userId, FcmMessage fcmMessage) {
        List<FcmToken> userTokens = fcmTokenRepository.findByUserUuid(userId);

        if (userTokens.isEmpty()) {
            log.warn("사용자 {}의 FCM 토큰이 없습니다.", userId);
            return;
        }

        for (FcmToken token : userTokens) {
            try {
                Message.Builder messageBuilder = Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(Notification.builder()
                        .setTitle(fcmMessage.getTitle())
                        .setBody(fcmMessage.getBody())
                        .build());

                // 데이터 추가
                if (fcmMessage.getData() != null) {
                    for (Map.Entry<String, String> entry : fcmMessage.getData().entrySet()) {
                        messageBuilder.putData(entry.getKey(), entry.getValue());
                    }
                }

                // 웹용 설정
                messageBuilder.setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink(fcmMessage.getClickAction())
                        .build())
                    .build());

                String response = firebaseMessaging.send(messageBuilder.build());
                log.debug("FCM 알림 전송 성공: userId={}, token={}, response={}", userId,
                    token.getFcmToken(), response);

            } catch (FirebaseMessagingException e) {
                log.error("FCM 알림 전송 실패: userId={}, token={}", userId, token.getFcmToken(), e);
                // 토큰이 유효하지 않은 경우 삭제
                if (e.getMessagingErrorCode() != null) {
                    fcmTokenRepository.delete(token);
                    log.info("유효하지 않은 FCM 토큰 삭제: {}", token.getFcmToken());
                }
            }
        }
    }
}
