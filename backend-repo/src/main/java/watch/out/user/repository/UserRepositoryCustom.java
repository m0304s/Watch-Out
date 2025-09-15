package watch.out.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.area.entity.Area;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.dto.request.ApproveUsersRequest;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.UserRole;

public interface UserRepositoryCustom {

    /**
     * 사용자 정보와 배정 구역 정보를 함께 조회
     *
     * @param userUuid 사용자 UUID
     * @return 사용자 정보 (구역 정보 포함)
     */
    Optional<UserWithAreaDto> findUserWithAreaById(UUID userUuid);

    PageResponse<UsersResponse> findUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, UserRole userRole, PageRequest pageRequest);

    Optional<UserResponse> findByUserIdAsDto(UUID userUuid);

    void updateAreaForUsers(List<UUID> uuids, Area area);

    PageResponse<UsersResponse> findUsersWhereIsApprovedIsFalse(PageRequest pageRequest);

    void updateIsApprovedForUsers(ApproveUsersRequest approveUsersRequest);
}
