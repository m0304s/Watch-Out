package watch.out.announcement.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.announcement.dto.request.AnnouncementRequest;
import watch.out.announcement.dto.response.AnnouncementResponse;
import watch.out.announcement.entity.Announcement;
import watch.out.announcement.repository.AnnouncementRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.notification.service.FcmService;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    @Override
    public List<AnnouncementResponse> sendAnnouncementToAreas(
        AnnouncementRequest announcementRequest) {
        // 현재 사용자 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        User sender = userRepository.findById(currentUserUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        List<AnnouncementResponse> allResponses = new ArrayList<>();
        Map<UUID, List<UUID>> areaWorkersMap = new HashMap<>();

        // 각 구역별로 작업자들 조회 및 공지사항 생성
        for (UUID areaUuid : announcementRequest.areaUuids()) {
            List<User> areaWorkers = userRepository.findByAreaUuidAndDeletedAtIsNull(areaUuid);

            if (areaWorkers.isEmpty()) {
                log.warn("구역 {}에 배치된 작업자가 없습니다.", areaUuid);
                continue;
            }

            // 공지사항 생성 (발신자 제외)
            List<AnnouncementResponse> areaResponses = areaWorkers.stream()
                .filter(user -> !user.getUuid().equals(currentUserUuid)) // 발신자 제외
                .map(user -> {
                    Announcement announcement = Announcement.builder()
                        .title(announcementRequest.title())
                        .content(announcementRequest.content())
                        .sender(sender)
                        .receiver(user)
                        .build();
                    return announcementRepository.save(announcement);
                })
                .map(AnnouncementResponse::from)
                .toList();

            allResponses.addAll(areaResponses);

            // 구역별 근로자 UUID 목록 저장
            List<UUID> workerUuids = areaWorkers.stream()
                .filter(user -> {
                    // 발신자 제외
                    if (user.getUuid().equals(currentUserUuid)) {
                        return false;
                    }
                    // AREA_ADMIN인 경우 ADMIN 역할 사용자 제외
                    if (sender.getRole() == UserRole.AREA_ADMIN
                        && user.getRole() == UserRole.ADMIN) {
                        return false;
                    }
                    return true;
                })
                .map(User::getUuid)
                .toList();

            // FCM 전송 대상이 있는 경우만 맵에 추가
            if (!workerUuids.isEmpty()) {
                areaWorkersMap.put(areaUuid, workerUuids);
                log.info("구역 {} FCM 전송 대상 추가: {}명", areaUuid, workerUuids.size());
            } else {
                log.info("구역 {} FCM 전송 대상 없음 (필터링 후 0명)", areaUuid);
            }
        }

        // 구역별로 MulticastMessage 전송
        log.info("FCM 전송 대상 맵 크기: {}", areaWorkersMap.size());
        if (!areaWorkersMap.isEmpty()) {
            try {
                fcmService.sendAnnouncementToAreaWorkers(areaWorkersMap,
                    announcementRequest.title(),
                    announcementRequest.content());
                log.info("구역별 공지사항 FCM 알림 전송 완료: 구역 수={}, 총 대상자 수={}",
                    areaWorkersMap.size(), allResponses.size());
            } catch (Exception e) {
                log.error("구역별 공지사항 FCM 알림 전송 실패: error={}", e.getMessage());
            }
        } else {
            log.info("FCM 전송 대상 구역이 없습니다.");
        }

        return allResponses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAnnouncementsByUser(UUID userUuid) {
        List<Announcement> announcements = announcementRepository.findByReceiverUuidOrderByCreatedAtDesc(
            userUuid);
        return announcements.stream()
            .map(AnnouncementResponse::from)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementDetail(UUID announcementUuid) {
        Announcement announcement = announcementRepository.findById(announcementUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        return AnnouncementResponse.from(announcement);
    }

}
