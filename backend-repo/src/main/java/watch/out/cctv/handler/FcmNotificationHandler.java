package watch.out.cctv.handler;

import watch.out.cctv.entity.Cctv;
import watch.out.safety.entity.SafetyViolationType;
import java.util.List;
import java.util.Map;

/**
 * FCM 알림 핸들러 인터페이스
 */
public interface FcmNotificationHandler {

    /**
     * 안전장비 미착용 알림 전송
     *
     * @param cctv           CCTV 정보
     * @param violationTypes 위반 유형 목록
     * @param snapshot       스냅샷 이미지 URL
     * @param areaName       구역명
     */
    void sendSafetyEquipmentViolationNotification(Cctv cctv,
        List<SafetyViolationType> violationTypes, String snapshot, String areaName);

    /**
     * 중장비 진입 알림 전송
     *
     * @param cctv                     CCTV 정보
     * @param heavyEquipmentDetections 중장비 감지 정보 (장비명 -> 개수)
     * @param snapshot                 스냅샷 이미지 URL
     * @param areaName                 구역명
     */
    void sendHeavyEquipmentEntryNotification(Cctv cctv,
        Map<String, Integer> heavyEquipmentDetections, String snapshot, String areaName);

}
