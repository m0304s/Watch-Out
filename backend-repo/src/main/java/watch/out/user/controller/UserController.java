package watch.out.user.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
import watch.out.user.service.UserService;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest signupRequest) {
        userService.createUser(signupRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<PageResponse<UsersResponse>> getUsers(
        @RequestParam(required = false) UUID areaUuid,
        @RequestParam(required = false) TrainingStatus trainingStatus,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) UserRole userRole,
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display) {
        PageRequest pageRequest = PageRequest.of(pageNum, display);
        PageResponse<UsersResponse> usersResponse = userService.getUsers(areaUuid,
            trainingStatus, search, userRole, pageRequest);
        return ResponseEntity.ok(usersResponse);
    }

    @GetMapping("/{userUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID userUuid) {
        UserResponse userResponse = userService.getUser(userUuid);
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/area")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<Void> assignArea(
        @Valid @RequestBody AssignAreaRequest assignAreaRequest) {
        userService.assignArea(assignAreaRequest);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID userUuid,
        @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        UserResponse userResponse = userService.updateUser(userUuid, updateUserRequest);
        return ResponseEntity.ok(userResponse);
    }

    @DeleteMapping("/{userUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userUuid) {
        userService.deleteUser(userUuid);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserRoleUpdateResponse> updateUserRole(
        @Valid @RequestBody UserRoleUpdateRequest userRoleUpdateRequest) {
        UserRoleUpdateResponse response = userService.updateUserRole(userRoleUpdateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UsersResponse>> getApprovalUsers(
        @RequestParam(defaultValue = "0") Integer pageNum,
        @RequestParam(defaultValue = "10") Integer display) {
        PageRequest pageRequest = PageRequest.of(pageNum, display);
        PageResponse<UsersResponse> usersResponse = userService.getApprovalUsers(pageRequest);
        return ResponseEntity.ok(usersResponse);
    }

    @PatchMapping("/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveUsers(
        @Valid @RequestBody ApproveUsersRequest approveUsersRequest) {
        userService.approveUsers(approveUsersRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/area/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignAreaAdmin(
        @Valid @RequestBody AssignAreaAdminRequest assignAreaAdminRequest) {
        userService.assignAreaAdmin(assignAreaAdminRequest);
        return ResponseEntity.noContent().build();
    }
}
