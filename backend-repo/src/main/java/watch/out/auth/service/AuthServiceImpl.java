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
import watch.out.auth.dto.request.LoginRequest;
import watch.out.auth.dto.response.LoginResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.CookieUtil;
import watch.out.common.util.JwtUtil;
import watch.out.common.util.SecurityUtil;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

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
        CookieUtil.addHttpOnlyCookie(response, "refresh_token", refreshToken,
            refreshTokenExpiration);

        return new LoginResponse(accessToken, user.getUuid(), user.getUserId(), user.getUserName(),
            user.getRole());
    }

    @Override
    public void logout(HttpServletRequest httpServletRequest,
        HttpServletResponse httpServletResponse) {
        Optional<UUID> currentUserUuid = SecurityUtil.getCurrentUserUuid();
        String key = "refresh_token:" + currentUserUuid;
        redisTemplate.delete(key);
        CookieUtil.deleteCookie(httpServletRequest, httpServletResponse, "refresh_token");
    }

    @Override
    public String reissueToken(HttpServletRequest httpServletRequest) {
        String refreshToken = CookieUtil.getCookieValue(httpServletRequest, "refresh_token");

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
