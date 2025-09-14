package watch.out.user.service;

import java.util.List;
import java.util.UUID;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.dto.request.AssignAreaRequest;
import watch.out.user.dto.request.SignupRequest;
import watch.out.user.dto.request.UpdateUserRequest;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;

public interface UserService {

    void createUser(SignupRequest signupRequest);

    PageResponse<UsersResponse> getUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, PageRequest pageRequest);

    UserResponse getUser(UUID userUuid);

    void assignArea(AssignAreaRequest assignAreaRequest);

    UserResponse updateUser(UUID userUuid, UpdateUserRequest updateUserRequest);

    void deleteUser(UUID userUuid);
}
