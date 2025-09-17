package watch.out.announcement.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.announcement.entity.Announcement;

public record AnnouncementResponse(
    UUID announcementUuid,
    String title,
    String content,
    String senderName,
    String receiverName,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime updatedAt
) {

    public static AnnouncementResponse from(Announcement announcement) {
        return new AnnouncementResponse(
            announcement.getUuid(),
            announcement.getTitle(),
            announcement.getContent(),
            announcement.getSender().getUserName(),
            announcement.getReceiver().getUserName(),
            announcement.getCreatedAt(),
            announcement.getUpdatedAt()
        );
    }
}
