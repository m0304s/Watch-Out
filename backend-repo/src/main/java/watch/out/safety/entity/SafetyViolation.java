package watch.out.safety.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import watch.out.area.entity.Area;
import watch.out.cctv.entity.Cctv;
import watch.out.common.entity.BaseTimeEntity;

@Entity
@Table(name = "safety_violation")
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SafetyViolation extends BaseTimeEntity {

    @OneToMany(mappedBy = "safetyViolation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SafetyViolationDetail> violationDetails;

    @Column(name = "image_key", length = 100)
    private String imageKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cctv_uuid", nullable = false)
    private Cctv cctv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_uuid", nullable = false)
    private Area area;
}
