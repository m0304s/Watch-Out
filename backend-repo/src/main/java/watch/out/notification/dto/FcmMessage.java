package watch.out.notification.dto;

import java.util.Map;

/**
 * FCM 알림 메시지 DTO
 *
 * @param title 알림 제목
 * @param body  알림 내용
 * @param data  추가 데이터 (키-값 쌍)
 */
public record FcmMessage(
    String title,
    String body,
    Map<String, String> data
) {

    /**
     * 데이터 없이 FCM 메시지 생성
     */
    public static FcmMessage of(String title, String body) {
        return new FcmMessage(title, body, null);
    }
}
