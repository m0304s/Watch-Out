package watch.out.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import watch.out.area.entity.Area;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;

public interface UserRepositoryCustom {

    PageResponse<UsersResponse> findUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, PageRequest pageRequest);

    Optional<UserResponse> findByUserIdAsDto(UUID userUuid);

    void updateAreaForUsers(List<UUID> uuids, Area area);
}
