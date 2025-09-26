package watch.out.user.service;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.user.dto.request.ApproveUsersRequest;
import watch.out.user.dto.request.AssignAreaAdminRequest;
import watch.out.user.dto.request.AssignAreaRequest;
import watch.out.user.dto.request.SignupRequest;
import watch.out.user.dto.request.UpdateUserRequest;
import watch.out.user.dto.request.UserRoleUpdateRequest;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UserRoleUpdateResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.UserRole;

public interface UserService {

    void createUser(SignupRequest signupRequest);

    PageResponse<UsersResponse> getUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, UserRole userRole, PageRequest pageRequest);

    UserResponse getUser(UUID userUuid);

    void assignArea(AssignAreaRequest assignAreaRequest);

    UserResponse updateUser(UUID userUuid, UpdateUserRequest updateUserRequest);

    void deleteUser(UUID userUuid);

    UserRoleUpdateResponse updateUserRole(UserRoleUpdateRequest request);

    PageResponse<UsersResponse> getApprovalUsers(PageRequest pageRequest);

    void approveUsers(@Valid ApproveUsersRequest approveUsersRequest);

    void assignAreaAdmin(@Valid AssignAreaAdminRequest assignAreaAdminRequest);

    /**
     * 사용자 정보와 배정 구역 정보를 함께 조회
     */
    UserWithAreaDto getUserWithArea(UUID userUuid);
}
