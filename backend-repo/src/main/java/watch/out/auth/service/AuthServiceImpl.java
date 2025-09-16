package watch.out.auth.service;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import watch.out.area.entity.AreaManager;
import watch.out.area.repository.AreaManagerRepository;
import watch.out.auth.dto.request.LoginRequest;
import watch.out.auth.dto.response.LoginResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.CookieUtil;
import watch.out.common.util.JwtUtil;
import watch.out.common.util.SecurityUtil;
import watch.out.notification.service.FcmService;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AreaManagerRepository areaManagerRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;
    private final StringRedisTemplate redisTemplate;
    private final FcmService fcmService;

    @Value("${jwt.refresh-token-expiration}")
    private int refreshTokenExpiration;

    @Override
    public LoginResponse login(LoginRequest loginRequest, HttpServletResponse response) {
        User user = userRepository.findByUserId(loginRequest.userId())
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_SIGNIN));

        if (!encoder.matches(loginRequest.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_SIGNIN);
        }

        String accessToken = jwtUtil.generateToken(user.getUuid(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUuid(), user.getRole());

        // 쿠키에 refreshToken 저장
        cookieUtil.addHttpOnlyCookie(response, "refresh_token", refreshToken,
            refreshTokenExpiration);

        Optional<AreaManager> areaManager = areaManagerRepository.findByUser_Uuid(user.getUuid());
        UUID areaUuid = areaManager.map(manager -> manager.getArea().getUuid()).orElse(null);

        return new LoginResponse(accessToken, user.getUuid(), user.getUserId(), user.getUserName(),
            user.getRole(), areaUuid, user.isApproved());
    }

    @Override
    public void logout(HttpServletRequest httpServletRequest,
        HttpServletResponse httpServletResponse) {
        Optional<UUID> currentUserUuid = SecurityUtil.getCurrentUserUuid();

        if (!currentUserUuid.isPresent()) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN);
        }

        UUID userUuid = currentUserUuid.get();

        String key = "refresh_token:" + userUuid;
        redisTemplate.delete(key);

        // FCM 토큰 초기화
        fcmService.clearUserFcmToken(userUuid);

        // 쿠키에서 refresh token 삭제
        cookieUtil.deleteCookie(httpServletRequest, httpServletResponse, "refresh_token");
    }

    @Override
    public String reissueToken(HttpServletRequest httpServletRequest) {
        String refreshToken = cookieUtil.getCookieValue(httpServletRequest, "refresh_token");

        if (refreshToken == null) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        try {
            jwtUtil.validateToken(refreshToken);

            String userUuid = jwtUtil.getSubject(refreshToken);
            String storedRefreshToken = redisTemplate.opsForValue()
                .get("refresh_token:" + userUuid);

            if (!refreshToken.equals(storedRefreshToken)) {
                throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
            }

            String roleClaim = jwtUtil.getRole(refreshToken);
            UserRole role = UserRole.valueOf(roleClaim);

            return jwtUtil.generateToken(UUID.fromString(userUuid), role);
        } catch (JwtException | IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
    }
}
