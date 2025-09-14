package watch.out.user.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.company.entity.Company;
import watch.out.company.repository.CompanyRepository;
import watch.out.user.dto.request.AssignAreaRequest;
import watch.out.user.dto.request.SignupRequest;
import watch.out.user.dto.request.UpdateUserRequest;
import watch.out.user.dto.request.UserRoleUpdateRequest;
import watch.out.user.dto.response.UserResponse;
import watch.out.user.dto.response.UserRoleUpdateResponse;
import watch.out.user.dto.response.UsersResponse;
import watch.out.user.entity.TrainingStatus;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final AreaRepository areaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void createUser(SignupRequest signupRequest) {
        if (userRepository.existsByUserId(signupRequest.userId())) {
            throw new BusinessException(ErrorCode.ALREADY_EXISTS);
        }

        Company company = companyRepository.findById(signupRequest.companyUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        String encodedPassword = passwordEncoder.encode(signupRequest.password());
        String photoKey = signupRequest.photoUrl(); // S3 생성 후 수정 필요

        User user = signupRequest.toEntity(encodedPassword, company, photoKey);
        userRepository.save(user);
    }

    @Override
    public PageResponse<UsersResponse> getUsers(UUID areaUuid, TrainingStatus trainingStatus,
        String search, PageRequest pageRequest) {
        PageResponse<UsersResponse> usersResponse = userRepository.findUsers(areaUuid,
            trainingStatus, search, pageRequest);
        return usersResponse;
    }

    @Override
    public UserResponse getUser(UUID userUuid) {
        UserResponse userResponse = userRepository.findByUserIdAsDto(userUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return userResponse;
    }

    @Override
    @Transactional
    public void assignArea(AssignAreaRequest assignAreaRequest) {
        Area area = areaRepository.findById(assignAreaRequest.areaUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        userRepository.updateAreaForUsers(assignAreaRequest.userUuids(), area);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID userUuid, UpdateUserRequest updateUserRequest) {
        User user = userRepository.findById(userUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        Company company = null;
        if (updateUserRequest.companyUuid() != null) {
            company = companyRepository.findById(updateUserRequest.companyUuid())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        }

        user.updateUser(
            updateUserRequest.userName(),
            updateUserRequest.contact(),
            updateUserRequest.emergencyContact(),
            updateUserRequest.bloodType(),
            updateUserRequest.rhFactor(),
            updateUserRequest.photoUrl(), // S3 생성 후 수정 필요
            company);

        // Watch 병합 후 수정 필요
//        Optional<Integer> watchNumber = entalHistoryRepository.findCurrentWatchNumberByUserUuid(userUuid);
        Optional<Integer> watchNumber = Optional.of(1);

        return UserResponse.from(user, watchNumber);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userUuid) {
        User user = userRepository.findByUuidAndDeletedAtIsNull(userUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        userRepository.delete(user);
    }

    @Override
    @Transactional
    public UserRoleUpdateResponse updateUserRole(UserRoleUpdateRequest request) {
        // 활성 사용자 조회 (소프트 삭제된 사용자 제외)
        User user = userRepository.findByUuidAndDeletedAtIsNull(request.userUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 현재 권한 저장 (변경 전)
        UserRole currentRole = user.getRole();

        // 현재 권한과 동일한 경우 예외 발생
        if (currentRole == request.newRole()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 권한 변경 로직 검증
        validateRoleChange(currentRole, request.newRole());

        // 권한 변경
        user.updateRole(request.newRole());

        return UserRoleUpdateResponse.of(
            user.getUuid(),
            user.getUserId(),
            user.getUserName(),
            request.newRole()
        );
    }

    /**
     * 권한 변경 유효성 검증
     *
     * @param currentRole 현재 권한
     * @param newRole     변경할 권한
     * @throws BusinessException 유효하지 않은 권한 변경인 경우
     */
    private void validateRoleChange(UserRole currentRole, UserRole newRole) {
        // ADMIN 권한은 변경할 수 없음
        if (currentRole == UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }

        // ADMIN으로 승격하는 것도 방지 (보안상 매우 민감한 작업)
        if (newRole == UserRole.ADMIN) {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }
}
