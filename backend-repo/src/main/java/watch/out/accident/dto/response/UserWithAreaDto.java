package watch.out.accident.dto.response;

import java.util.UUID;
import watch.out.common.util.AreaNameUtil;

/**
 * 사용자와 배정 구역 정보를 함께 담는 DTO
 */
public record UserWithAreaDto(
    UUID userUuid,
    String userId,
    String userName,
    String contact,
    String emergencyContact,
    String bloodType,
    String rhFactor,
    String companyName,
    UUID areaUuid,
    String areaName,
    String areaAlias
) {

    public boolean hasAssignedArea() {
        return areaUuid != null;
    }

    public String getFormattedAreaName() {
        return AreaNameUtil.formatAreaName(areaName, areaAlias);
    }

    /**
     * 사용자와 구역 정보 생성
     */
    public static UserWithAreaDto of(UUID userUuid, String userId, String userName,
        String contact, String emergencyContact, String bloodType, String rhFactor,
        String companyName, UUID areaUuid, String areaName, String areaAlias) {
        return new UserWithAreaDto(userUuid, userId, userName, contact, emergencyContact,
            bloodType, rhFactor, companyName, areaUuid, areaName, areaAlias);
    }
}