package watch.out.accident.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import watch.out.area.entity.Area;
import watch.out.common.entity.BaseTimeEntity;
import watch.out.user.entity.User;

@Entity
@Table(name = "accident")
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Accident extends BaseTimeEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private AccidentType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_uuid", nullable = false)
    private Area area;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "user_uuid", nullable = false)
    private User user;
}
