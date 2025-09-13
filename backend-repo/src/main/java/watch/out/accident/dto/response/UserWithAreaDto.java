package watch.out.accident.dto.response;

import java.util.UUID;
import watch.out.area.entity.Area;
import watch.out.user.entity.User;

/**
 * 사용자와 배정 구역 정보를 함께 조회하는 DTO
 */
public record UserWithAreaDto(
    User user,
    Area area
) {

    /**
     * 사용자가 배정받은 구역이 있는지 확인
     */
    public boolean hasAssignedArea() {
        return area != null;
    }

    /**
     * 구역명과 별칭을 조합하여 반환
     */
    public String getFormattedAreaName() {
        if (area == null) {
            return null;
        }
        return area.getAreaName() + (area.getAreaAlias() != null ? " " + area.getAreaAlias() : "");
    }
}
