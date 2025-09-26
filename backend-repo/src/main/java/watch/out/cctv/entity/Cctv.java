package watch.out.cctv.entity;

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

import java.util.UUID;

@Entity
@Table(name = "cctv")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
public class Cctv extends BaseTimeEntity {

    @Column(name = "cctv_name", length = 50, nullable = false)
    private String cctvName;

    @Column(name = "is_online", nullable = false)
    private boolean isOnline;

    @Column(name = "cctv_url", length = 100, nullable = false)
    private String cctvUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Type type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_uuid", nullable = false) // 컬럼명 그대로 사용
    private Area area;

    public void changeOnline(boolean value) {
        this.isOnline = value;
    }

    public void update(String name, String url, Type type, Area area, Boolean isOnline) {
        this.cctvName = name;
        this.cctvUrl = url;
        this.type = type;
        this.area = area;
        this.isOnline = isOnline;
    }
}
