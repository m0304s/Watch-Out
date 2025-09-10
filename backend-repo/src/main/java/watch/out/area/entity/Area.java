package watch.out.area.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import watch.out.common.entity.BaseTimeEntity;

@Entity
@Table(name = "area")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Area extends BaseTimeEntity {

    @Column(name = "area_name", nullable = false, length = 50)
    private String areaName;

    @Column(name = "area_alias", length = 50)
    private String areaAlias;
}
