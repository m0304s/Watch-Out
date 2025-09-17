package watch.out.announcement.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import watch.out.announcement.entity.Announcement;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {

    /**
     * 특정 사용자가 받은 공지사항 목록 조회 (최신순)
     */
    List<Announcement> findByReceiverUuidOrderByCreatedAtDesc(UUID receiverUuid);
}
