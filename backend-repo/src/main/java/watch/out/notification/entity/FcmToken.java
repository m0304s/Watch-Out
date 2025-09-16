package watch.out.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import watch.out.common.entity.BaseTimeEntity;
import java.util.UUID;

@Entity
@Table(name = "fcm_tokens")
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FcmToken extends BaseTimeEntity {

    @Column(name = "fcm_token", length = 255)
    private String fcmToken;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;
}