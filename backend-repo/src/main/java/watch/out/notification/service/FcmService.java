package watch.out.notification.service;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.WebpushConfig;
import com.google.firebase.messaging.WebpushFcmOptions;
import com.google.firebase.messaging.SendResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
        List<String> violationTypes, String imageUrl, UUID violationUuid) {
        try {
            // 해당 구역의 AREA_ADMIN 담당자들 조회
            List<AreaManager> areaManagers = areaManagerRepository.findByAreaUuid(areaUuid);
            List<UUID> areaManagerUuids = areaManagers.stream()
                .map(areaManager -> areaManager.getUser().getUuid())
                .toList();

            // 최고 관리자(ADMIN) 사용자들만 조회
            List<User> adminUsers = userRepository.findByRoleInAndDeletedAtIsNull(
                List.of(UserRole.ADMIN));
            List<UUID> adminUuids = adminUsers.stream()
                .map(User::getUuid)
                .toList();

            // 해당 구역 담당자와 최고 관리자 UUID 합치기
            List<UUID> allManagerUuids = List.of(areaManagerUuids, adminUuids)
                .stream()
                .flatMap(List::stream)
                .distinct()
                .toList();

            if (allManagerUuids.isEmpty()) {
                log.warn("구역 {}의 담당자나 ADMIN이 없습니다.", areaName);
                return;
            }

            // 담당자들의 유효한 FCM 토큰 조회 (null이 아닌 토큰만)
            List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                allManagerUuids);

            if (fcmTokens.isEmpty()) {
                log.warn("구역 {} 담당자들의 FCM 토큰이 없습니다.", areaName);
                return;
            }

            String title = "안전장비 미착용 감지";
            String body = String.format("[%s] %s에서 %s 미착용이 감지되었습니다.",
                areaName, cctvName, String.join(", ", violationTypes));

            // 담당자들에게 알림 전송
            sendNotification(fcmTokens, title, body, areaName, cctvName, violationTypes, imageUrl,
                violationUuid);

            log.info("안전장비 위반 알림 전송 완료: area={}, cctv={}, areaManagers={}, admins={}, tokens={}",
                areaName, cctvName, areaManagerUuids.size(), adminUuids.size(), fcmTokens.size());

        } catch (Exception e) {
            log.error("안전장비 위반 알림 전송 실패: area={}, cctv={}", areaName, cctvName, e);
        }
    }

    /**
     * 중장비 진입 알림 전송 (구역 담당자와 관리자에게)
     */
    public void sendHeavyEquipmentEntryNotification(UUID areaUuid, String areaName, String cctvName,
        List<String> heavyEquipmentTypes, String imageUrl) {
        try {
            // 해당 구역의 AREA_ADMIN 담당자들 조회
            List<AreaManager> areaManagers = areaManagerRepository.findByAreaUuid(areaUuid);
            List<UUID> areaManagerUuids = areaManagers.stream()
                .map(areaManager -> areaManager.getUser().getUuid())
                .toList();

            // 최고 관리자(ADMIN) 사용자들 조회
            List<User> adminUsers = userRepository.findByRoleInAndDeletedAtIsNull(
                List.of(UserRole.ADMIN));
            List<UUID> adminUuids = adminUsers.stream()
                .map(User::getUuid)
                .toList();

            // 해당 구역 담당자와 최고 관리자 UUID 합치기
            List<UUID> allManagerUuids = List.of(areaManagerUuids, adminUuids)
                .stream()
                .flatMap(List::stream)
                .distinct()
                .toList();

            if (allManagerUuids.isEmpty()) {
                log.warn("구역 {}의 담당자나 ADMIN이 없습니다.", areaName);
                return;
            }

            // 담당자들의 유효한 FCM 토큰 조회 (null이 아닌 토큰만)
            List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                allManagerUuids);

            if (fcmTokens.isEmpty()) {
                log.warn("구역 {} 담당자들의 FCM 토큰이 없습니다.", areaName);
                return;
            }

            String title = "중장비 진입 감지";
            String body = String.format("[%s] %s에서 %s 진입이 감지되었습니다.",
                areaName, cctvName, String.join(", ", heavyEquipmentTypes));

            // 담당자들에게 알림 전송
            sendHeavyEquipmentNotification(fcmTokens, title, body, areaName, cctvName,
                heavyEquipmentTypes, imageUrl);

            log.info("중장비 진입 알림 전송 완료: area={}, cctv={}, areaManagers={}, admins={}, tokens={}",
                areaName, cctvName, areaManagerUuids.size(), adminUuids.size(), fcmTokens.size());

        } catch (Exception e) {
            log.error("중장비 진입 알림 전송 실패: area={}, cctv={}", areaName, cctvName, e);
        }
    }

    /**
     * FCM 알림 전송 (MulticastMessage 사용)
     */
    private void sendNotification(List<FcmToken> tokens, String title, String body,
        String areaName, String cctvName, List<String> violationTypes, String imageUrl,
        UUID violationUuid) {

        if (tokens.isEmpty()) {
            return;
        }

        // 토큰 리스트 추출
        List<String> tokenStrings = tokens.stream()
            .map(FcmToken::getFcmToken)
            .toList();

        try {
            // MulticastMessage 생성 (웹과 모바일 모두 지원)
            MulticastMessage.Builder messageBuilder = MulticastMessage.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .setImage(imageUrl)
                    .build())
                .setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/dashboard")
                        .build())
                    .build())
                .setAndroidConfig(AndroidConfig.builder()
                    .setNotification(AndroidNotification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl)
                        .setChannelId("safety_violations")
                        .setPriority(AndroidNotification.Priority.HIGH)
                        .setSound("default")
                        .build())
                    .build())
                .putData("areaName", areaName)
                .putData("cctvName", cctvName)
                .putData("violationTypes", String.join(",", violationTypes))
                .putData("imageUrl", imageUrl)
                .putData("type", "SAFETY_VIOLATION");

            // violation UUID가 있는 경우에만 추가
            if (violationUuid != null) {
                messageBuilder.putData("violationUuid", violationUuid.toString());
            }

            MulticastMessage message = messageBuilder
                .addAllTokens(tokenStrings)
                .build();

            // 일괄 전송
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);

            log.info("FCM 알림 일괄 전송 완료: 성공={}, 실패={}",
                response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    SendResponse sendResponse = responses.get(i);
                    if (!sendResponse.isSuccessful()) {
                        String token = tokenStrings.get(i);
                        log.error("FCM 알림 전송 실패: token={}, error={}",
                            token, sendResponse.getException().getMessage());

                        // 토큰이 유효하지 않은 경우 삭제
                        if (sendResponse.getException() instanceof FirebaseMessagingException) {
                            FirebaseMessagingException e = (FirebaseMessagingException) sendResponse.getException();
                            if (e.getMessagingErrorCode() != null) {
                                fcmTokenRepository.clearFcmTokenByToken(token);
                                log.info("유효하지 않은 FCM 토큰 삭제: {}", token);
                            }
                        }
                    }
                }
            }

        } catch (FirebaseMessagingException e) {
            log.error("FCM 알림 일괄 전송 실패", e);
        }
    }

    /**
     * 중장비 진입 FCM 알림 전송 (MulticastMessage 사용)
     */
    private void sendHeavyEquipmentNotification(List<FcmToken> tokens, String title, String body,
        String areaName, String cctvName, List<String> heavyEquipmentTypes, String imageUrl) {

        if (tokens.isEmpty()) {
            return;
        }

        // 토큰 리스트 추출
        List<String> tokenStrings = tokens.stream()
            .map(FcmToken::getFcmToken)
            .toList();

        try {
            // MulticastMessage 생성 (웹과 모바일 모두 지원)
            MulticastMessage message = MulticastMessage.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .setImage(imageUrl)
                    .build())
                .setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/dashboard")
                        .build())
                    .build())
                .setAndroidConfig(AndroidConfig.builder()
                    .setNotification(AndroidNotification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setImage(imageUrl)
                        .setChannelId("heavy_equipment")
                        .setPriority(AndroidNotification.Priority.HIGH)
                        .setSound("default")
                        .build())
                    .build())
                .putData("areaName", areaName)
                .putData("cctvName", cctvName)
                .putData("heavyEquipmentTypes", String.join(",", heavyEquipmentTypes))
                .putData("imageUrl", imageUrl)
                .putData("type", "HEAVY_EQUIPMENT")
                .addAllTokens(tokenStrings)
                .build();

            // 일괄 전송
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);

            log.info("중장비 진입 FCM 알림 일괄 전송 완료: 성공={}, 실패={}",
                response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    SendResponse sendResponse = responses.get(i);
                    if (!sendResponse.isSuccessful()) {
                        String token = tokenStrings.get(i);
                        log.error("중장비 진입 FCM 알림 전송 실패: token={}, error={}",
                            token, sendResponse.getException().getMessage());

                        // 토큰이 유효하지 않은 경우 삭제
                        if (sendResponse.getException() instanceof FirebaseMessagingException) {
                            FirebaseMessagingException e = (FirebaseMessagingException) sendResponse.getException();
                            if (e.getMessagingErrorCode() != null) {
                                fcmTokenRepository.clearFcmTokenByToken(token);
                                log.info("유효하지 않은 FCM 토큰 삭제: {}", token);
                            }
                        }
                    }
                }
            }

        } catch (FirebaseMessagingException e) {
            log.error("중장비 진입 FCM 알림 일괄 전송 실패", e);
        }
    }

    /**
     * 특정 사용자에게 알림 전송
     */
    public void sendNotificationToUser(UUID userUuid, FcmMessage fcmMessage) {
        List<FcmToken> userTokens = fcmTokenRepository.findByUserUuid(userUuid);

        if (userTokens.isEmpty()) {
            log.warn("사용자 {}의 FCM 토큰이 없습니다.", userUuid);
            return;
        }

        for (FcmToken token : userTokens) {
            try {
                Message.Builder messageBuilder = Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(Notification.builder()
                        .setTitle(fcmMessage.title())
                        .setBody(fcmMessage.body())
                        .build());

                // 데이터 추가
                if (fcmMessage.data() != null) {
                    for (Map.Entry<String, String> entry : fcmMessage.data().entrySet()) {
                        messageBuilder.putData(entry.getKey(), entry.getValue());
                    }
                }

                // 웹용 설정 - 알림 클릭 시 대시보드로 이동
                messageBuilder.setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/dashboard")
                        .build())
                    .build());

                String response = firebaseMessaging.send(messageBuilder.build());
                log.debug("FCM 알림 전송 성공: userUuid={}, token={}, response={}", userUuid,
                    token.getFcmToken(), response);

            } catch (FirebaseMessagingException e) {
                log.error("FCM 알림 전송 실패: userUuid={}, token={}", userUuid, token.getFcmToken(), e);
                // 토큰이 유효하지 않은 경우 null로 업데이트
                if (e.getMessagingErrorCode() != null) {
                    fcmTokenRepository.clearFcmTokenByToken(token.getFcmToken());
                    log.info("유효하지 않은 FCM 토큰을 null로 업데이트: {}", token.getFcmToken());
                }
            }
        }
    }

    /**
     * 사용자 로그아웃 시 FCM 토큰을 null로 설정
     */
    @Transactional
    public void clearUserFcmToken(UUID userUuid) {
        try {
            fcmTokenRepository.clearFcmTokenByUserUuid(userUuid);
            log.info("사용자 {}의 FCM 토큰을 초기화했습니다.", userUuid);
        } catch (Exception e) {
            log.error("사용자 {}의 FCM 토큰 초기화 실패", userUuid, e);
        }
    }

    /**
     * 특정 FCM 토큰을 null로 설정
     */
    @Transactional
    public void clearFcmToken(String fcmToken) {
        try {
            fcmTokenRepository.clearFcmTokenByToken(fcmToken);
            log.info("FCM 토큰 {}을 초기화했습니다.", fcmToken);
        } catch (Exception e) {
            log.error("FCM 토큰 {} 초기화 실패", fcmToken, e);
        }
    }

    /**
     * 모든 사용자에게 공지사항 전송
     */
    public void sendAnnouncementToAll(String title, String content) {
        try {
            // 모든 사용자 조회
            List<User> allUsers = userRepository.findByDeletedAtIsNull();
            List<UUID> allUserUuids = allUsers.stream()
                .map(User::getUuid)
                .toList();

            if (allUserUuids.isEmpty()) {
                log.warn("전송할 사용자가 없습니다.");
                return;
            }

            // 모든 사용자의 FCM 토큰 조회
            List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                allUserUuids);

            if (fcmTokens.isEmpty()) {
                log.warn("FCM 토큰이 등록된 사용자가 없습니다.");
                return;
            }

            sendAnnouncementNotification(fcmTokens, title, content);
            log.info("전체 공지사항 FCM 전송 완료: 대상자 수={}", fcmTokens.size());

        } catch (Exception e) {
            log.error("전체 공지사항 FCM 전송 실패", e);
        }
    }

    /**
     * 특정 사용자들에게 공지사항 전송
     */
    public void sendAnnouncementToUsers(List<UUID> userUuids, String title, String content) {
        try {
            if (userUuids.isEmpty()) {
                log.warn("전송할 사용자가 없습니다.");
                return;
            }

            // 대상 사용자들의 FCM 토큰 조회
            List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                userUuids);

            if (fcmTokens.isEmpty()) {
                log.warn("FCM 토큰이 등록된 사용자가 없습니다.");
                return;
            }

            sendAnnouncementNotification(fcmTokens, title, content);
            log.info("사용자별 공지사항 FCM 전송 완료: 대상자 수={}", fcmTokens.size());

        } catch (Exception e) {
            log.error("사용자별 공지사항 FCM 전송 실패", e);
        }
    }

    /**
     * 구역별 근로자들에게 공지사항 전송 (MulticastMessage 사용)
     */
    public void sendAnnouncementToAreaWorkers(Map<UUID, List<UUID>> areaWorkersMap, String title,
        String content) {
        try {
            if (areaWorkersMap.isEmpty()) {
                log.warn("전송할 구역이 없습니다.");
                return;
            }

            int totalSentCount = 0;
            int totalAreaCount = 0;

            // 각 구역별로 FCM 토큰 조회 및 전송
            for (Map.Entry<UUID, List<UUID>> entry : areaWorkersMap.entrySet()) {
                UUID areaUuid = entry.getKey();
                List<UUID> workerUuids = entry.getValue();

                log.info("구역 {} 처리 시작: 근로자 수={}", areaUuid, workerUuids.size());

                if (workerUuids.isEmpty()) {
                    log.warn("구역 {}에 배치된 근로자가 없습니다.", areaUuid);
                    continue;
                }

                // 해당 구역 근로자들의 FCM 토큰 조회
                List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                    workerUuids);

                log.info("구역 {} FCM 토큰 조회 결과: {}명 중 {}명", areaUuid, workerUuids.size(),
                    fcmTokens.size());

                if (fcmTokens.isEmpty()) {
                    log.warn("구역 {}의 근로자들 중 FCM 토큰이 등록된 사용자가 없습니다.", areaUuid);
                    continue;
                }

                // 구역별로 MulticastMessage 전송
                sendAreaAnnouncementNotification(fcmTokens, areaUuid, title, content);
                totalSentCount += fcmTokens.size();
                totalAreaCount++;
            }

            log.info("구역별 공지사항 FCM 전송 완료: 구역 수={}, 총 대상자 수={}", totalAreaCount, totalSentCount);

        } catch (Exception e) {
            log.error("구역별 공지사항 FCM 전송 실패", e);
        }
    }

    /**
     * 공지사항 FCM 알림 전송
     */
    private void sendAnnouncementNotification(List<FcmToken> tokens, String title, String content) {
        if (tokens.isEmpty()) {
            return;
        }

        // 토큰 리스트 추출
        List<String> tokenStrings = tokens.stream()
            .map(FcmToken::getFcmToken)
            .toList();

        try {
            // MulticastMessage 생성
            MulticastMessage message = MulticastMessage.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(content)
                    .build())
                .setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/announcements")
                        .build())
                    .build())
                .putData("type", "ANNOUNCEMENT")
                .putData("title", title)
                .putData("content", content)
                .addAllTokens(tokenStrings)
                .build();

            // 일괄 전송
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);

            log.info("공지사항 FCM 알림 일괄 전송 완료: 성공={}, 실패={}",
                response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    SendResponse sendResponse = responses.get(i);
                    if (!sendResponse.isSuccessful()) {
                        String failedToken = tokenStrings.get(i);
                        log.warn("FCM 토큰 전송 실패: token={}, error={}",
                            failedToken, sendResponse.getException().getMessage());

                        // 토큰이 유효하지 않은 경우 null로 업데이트
                        fcmTokenRepository.clearFcmTokenByToken(failedToken);
                    }
                }
            }

        } catch (Exception e) {
            log.error("공지사항 FCM 알림 전송 중 오류 발생", e);
        }
    }

    /**
     * 구역별 공지사항 FCM 알림 전송 (MulticastMessage 사용)
     */
    private void sendAreaAnnouncementNotification(List<FcmToken> tokens, UUID areaUuid,
        String title, String content) {
        if (tokens.isEmpty()) {
            return;
        }

        // 토큰 리스트 추출
        List<String> tokenStrings = tokens.stream()
            .map(FcmToken::getFcmToken)
            .toList();

        try {
            // MulticastMessage 생성 (웹과 모바일 모두 지원)
            MulticastMessage message = MulticastMessage.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(content)
                    .build())
                .setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/announcements")
                        .build())
                    .build())
                .setAndroidConfig(AndroidConfig.builder()
                    .setNotification(AndroidNotification.builder()
                        .setTitle(title)
                        .setBody(content)
                        .setChannelId("announcements")
                        .setPriority(AndroidNotification.Priority.HIGH)
                        .setSound("default")
                        .build())
                    .build())
                .putData("type", "ANNOUNCEMENT")
                .putData("areaUuid", areaUuid.toString())
                .putData("title", title)
                .putData("content", content)
                .addAllTokens(tokenStrings)
                .build();

            // 일괄 전송
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);

            log.info("구역 {} 공지사항 FCM 알림 전송 완료: 성공={}, 실패={}",
                areaUuid, response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    SendResponse sendResponse = responses.get(i);
                    if (!sendResponse.isSuccessful()) {
                        String failedToken = tokenStrings.get(i);
                        log.warn("구역 {} FCM 토큰 전송 실패: token={}, error={}",
                            areaUuid, failedToken, sendResponse.getException().getMessage());

                        // 토큰이 유효하지 않은 경우 null로 업데이트
                        fcmTokenRepository.clearFcmTokenByToken(failedToken);
                    }
                }
            }

        } catch (Exception e) {
            log.error("구역 {} 공지사항 FCM 알림 전송 중 오류 발생", areaUuid, e);
        }
    }

    /**
     * 사고 신고 알림 전송 (구역 담당자와 관리자에게)
     */
    public void sendAccidentReportNotification(UUID areaUuid, String areaName, String accidentType,
        String reporterName, String companyName, UUID accidentUuid) {
        try {
            // 해당 구역의 AREA_ADMIN 담당자들 조회
            List<AreaManager> areaManagers = areaManagerRepository.findByAreaUuid(areaUuid);
            List<UUID> areaManagerUuids = areaManagers.stream()
                .map(areaManager -> areaManager.getUser().getUuid())
                .toList();

            // 최고 관리자(ADMIN) 사용자들 조회
            List<User> adminUsers = userRepository.findByRoleInAndDeletedAtIsNull(
                List.of(UserRole.ADMIN));
            List<UUID> adminUuids = adminUsers.stream()
                .map(User::getUuid)
                .toList();

            // 해당 구역 담당자와 최고 관리자 UUID 합치기
            List<UUID> allManagerUuids = List.of(areaManagerUuids, adminUuids)
                .stream()
                .flatMap(List::stream)
                .distinct()
                .toList();

            if (allManagerUuids.isEmpty()) {
                log.warn("구역 {}의 담당자나 ADMIN이 없습니다.", areaName);
                return;
            }

            // 담당자들의 유효한 FCM 토큰 조회 (null이 아닌 토큰만)
            List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuidInAndFcmTokenIsNotNull(
                allManagerUuids);

            if (fcmTokens.isEmpty()) {
                log.warn("구역 {} 담당자들의 FCM 토큰이 없습니다.", areaName);
                return;
            }

            String title = "사고 신고 접수";
            String body = String.format("[%s] %s에서 %s 사고가 신고되었습니다. (신고자: %s, %s)",
                areaName, areaName, accidentType, reporterName, companyName);

            // 담당자들에게 알림 전송
            sendAccidentNotification(fcmTokens, title, body, areaName, accidentType,
                reporterName, companyName, accidentUuid);

            log.info(
                "사고 신고 알림 전송 완료: area={}, accidentType={}, areaManagers={}, admins={}, tokens={}",
                areaName, accidentType, areaManagerUuids.size(), adminUuids.size(),
                fcmTokens.size());

        } catch (Exception e) {
            log.error("사고 신고 알림 전송 실패: area={}, accidentType={}", areaName, accidentType, e);
        }
    }

    /**
     * 사고 신고 FCM 알림 전송 (MulticastMessage 사용)
     */
    private void sendAccidentNotification(List<FcmToken> tokens, String title, String body,
        String areaName, String accidentType, String reporterName, String companyName,
        UUID accidentUuid) {

        if (tokens.isEmpty()) {
            return;
        }

        // 토큰 리스트 추출
        List<String> tokenStrings = tokens.stream()
            .map(FcmToken::getFcmToken)
            .toList();

        try {
            // MulticastMessage 생성 (웹과 모바일 모두 지원)
            MulticastMessage message = MulticastMessage.builder()
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .setWebpushConfig(WebpushConfig.builder()
                    .setFcmOptions(WebpushFcmOptions.builder()
                        .setLink("/accidents")
                        .build())
                    .build())
                .setAndroidConfig(AndroidConfig.builder()
                    .setNotification(AndroidNotification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .setChannelId("accident_reports")
                        .setPriority(AndroidNotification.Priority.HIGH)
                        .setSound("default")
                        .build())
                    .build())
                .putData("areaName", areaName)
                .putData("accidentType", accidentType)
                .putData("reporterName", reporterName)
                .putData("companyName", companyName)
                .putData("accidentUuid", accidentUuid.toString())
                .putData("type", "ACCIDENT_REPORT")
                .addAllTokens(tokenStrings)
                .build();

            // 일괄 전송
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);

            log.info("사고 신고 FCM 알림 일괄 전송 완료: 성공={}, 실패={}",
                response.getSuccessCount(), response.getFailureCount());

            // 실패한 토큰들 처리
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                for (int i = 0; i < responses.size(); i++) {
                    SendResponse sendResponse = responses.get(i);
                    if (!sendResponse.isSuccessful()) {
                        String token = tokenStrings.get(i);
                        log.error("사고 신고 FCM 알림 전송 실패: token={}, error={}",
                            token, sendResponse.getException().getMessage());

                        // 토큰이 유효하지 않은 경우 삭제
                        if (sendResponse.getException() instanceof FirebaseMessagingException) {
                            FirebaseMessagingException e = (FirebaseMessagingException) sendResponse.getException();
                            if (e.getMessagingErrorCode() != null) {
                                fcmTokenRepository.clearFcmTokenByToken(token);
                                log.info("유효하지 않은 FCM 토큰 삭제: {}", token);
                            }
                        }
                    }
                }
            }

        } catch (FirebaseMessagingException e) {
            log.error("사고 신고 FCM 알림 일괄 전송 실패", e);
        }
    }
}
