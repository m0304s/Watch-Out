package watch.out.notification.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.common.util.SecurityUtil;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.notification.dto.request.FcmTokenRequest;
import watch.out.notification.dto.response.FcmTokenResponse;
import watch.out.notification.entity.FcmToken;
import watch.out.notification.repository.FcmTokenRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class FcmTokenService {

    private final FcmTokenRepository fcmTokenRepository;

    /**
     * FCM 토큰 등록
     */
    public FcmToken registerToken(FcmTokenRequest fcmTokenRequest) {
        UUID userUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        // 기존 토큰이 있는지 확인
        FcmToken existingToken = fcmTokenRepository.findByFcmToken(fcmTokenRequest.token());

        if (existingToken != null) {
            // 기존 토큰이 다른 사용자 것인 경우 업데이트
            if (!existingToken.getUserUuid().equals(userUuid)) {
                existingToken = existingToken.toBuilder()
                    .userUuid(userUuid)
                    .build();
            }
            return fcmTokenRepository.save(existingToken);
        }

        // 새 토큰 생성
        FcmToken newToken = FcmToken.builder()
            .userUuid(userUuid)
            .fcmToken(fcmTokenRequest.token())
            .build();

        return fcmTokenRepository.save(newToken);
    }

    /**
     * FCM 토큰 삭제
     */
    public void removeToken(String token) {
        FcmToken fcmToken = fcmTokenRepository.findByFcmToken(token);
        if (fcmToken != null) {
            fcmTokenRepository.delete(fcmToken);
        }
    }

    /**
     * 내 FCM 토큰 목록 조회
     */
    @Transactional(readOnly = true)
    public FcmTokenResponse getMyTokens() {
        UUID userUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));
        List<FcmToken> fcmTokens = fcmTokenRepository.findByUserUuid(userUuid);
        return FcmTokenResponse.from(fcmTokens);
    }
}
