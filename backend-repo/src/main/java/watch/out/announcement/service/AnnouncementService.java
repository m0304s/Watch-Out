package watch.out.announcement.service;

import java.util.List;
import java.util.UUID;
import watch.out.announcement.dto.request.AnnouncementRequest;
import watch.out.announcement.dto.response.AnnouncementResponse;
import watch.out.announcement.entity.Announcement;

public interface AnnouncementService {

    /**
     * 여러 구역의 작업자들에게 공지사항 전송 (FCM 포함)
     *
     * @param request 공지사항 전송 요청
     * @return 전송된 공지사항 목록
     */
    List<AnnouncementResponse> sendAnnouncementToAreas(AnnouncementRequest announcementRequest);

    /**
     * 특정 사용자의 공지사항 목록 조회
     *
     * @param userUuid 사용자 UUID
     * @return 공지사항 목록
     */
    List<AnnouncementResponse> getAnnouncementsByUser(UUID userUuid);

    /**
     * 공지사항 상세 조회
     *
     * @param announcementUuid 공지사항 UUID
     * @return 공지사항 상세 정보
     */
    AnnouncementResponse getAnnouncementDetail(UUID announcementUuid);

}
