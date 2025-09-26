package watch.out.common.util;

import java.util.Optional;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import watch.out.user.entity.UserRole;

public class SecurityUtil {

    /**
     * 현재 사용자의 UUID를 반환합니다.
     *
     * @return 사용자 UUID가 있으면 Optional.of(UUID), 없으면 Optional.empty()
     */
    public static Optional<UUID> getCurrentUserUuid() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            try {
                return Optional.of(UUID.fromString((String) authentication.getPrincipal()));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        }
        return Optional.empty();
    }

    /**
     * 현재 사용자의 역할을 반환합니다.
     *
     * @return 사용자 역할이 있으면 Optional.of(UserRole), 없으면 Optional.empty()
     */
    public static Optional<UserRole> getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                .map(authority -> {
                    String authorityName = authority.getAuthority();
                    if (authorityName.startsWith("ROLE_")) {
                        try {
                            return UserRole.valueOf(authorityName.substring(5));
                        } catch (IllegalArgumentException e) {
                            return null;
                        }
                    }
                    return null;
                })
                .filter(role -> role != null)
                .findFirst();
        }
        return Optional.empty();
    }

    /**
     * 현재 사용자가 ADMIN 역할인지 확인합니다.
     *
     * @return ADMIN이면 true, 아니면 false
     */
    public static boolean isAdmin() {
        return getCurrentUserRole().map(role -> role == UserRole.ADMIN).orElse(false);
    }

    /**
     * 현재 사용자가 AREA_ADMIN 역할인지 확인합니다.
     *
     * @return AREA_ADMIN이면 true, 아니면 false
     */
    public static boolean isAreaAdmin() {
        return getCurrentUserRole().map(role -> role == UserRole.AREA_ADMIN).orElse(false);
    }

    /**
     * 현재 사용자가 WORKER 역할인지 확인합니다.
     *
     * @return WORKER이면 true, 아니면 false
     */
    public static boolean isWorker() {
        return getCurrentUserRole().map(role -> role == UserRole.WORKER).orElse(false);
    }
}
