package watch.out.watch.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import watch.out.common.entity.BaseTimeEntity;

@Entity
@Table(name = "watch")
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Watch extends BaseTimeEntity {

    @Column(name = "watch_id", unique = true, insertable = false, nullable = false, updatable = false)
    private Integer watchId;

    @Column(name = "model_name", length = 50)
    private String modelName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchStatus status;

    @Column(length = 50)
    private String note;

    @PrePersist
    public void applyDefaults() {
        if (this.status == null) {
            this.status = WatchStatus.AVAILABLE;
        }
    }

    public void update(String modelName, WatchStatus status, String note) {
        this.modelName = modelName;
        this.status = status;
        this.note = note;
    }

    public void updateStatus(WatchStatus status) {
        this.status = status;
    }
}
