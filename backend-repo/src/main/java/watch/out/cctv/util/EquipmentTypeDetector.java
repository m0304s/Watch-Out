package watch.out.cctv.util;

import java.util.Set;
import watch.out.safety.util.SafetyViolationMapper;

/**
 * AI 트리거를 분석하여 장비 유형을 구분하는 유틸리티
 */
public class EquipmentTypeDetector {

    // 중장비 관련 트리거들
    private static final Set<String> HEAVY_EQUIPMENT_TRIGGERS = Set.of(
        "Excavator", "Crane", "Bulldozer", "Loader", "Dump Truck",
        "Forklift", "Fork lane", "Concrete Mixer", "Pile Driver", "Grader",
        "Backhoe", "Skid Steer", "Tower Crane", "Mobile Crane", "Truck Crane",
        "Wheel Loader", "Track Loader", "Compactor", "Roller", "Paver"
    );

    /**
     * 트리거가 안전장비 관련인지 확인
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 안전장비 관련 트리거인 경우 true
     */
    public static boolean isSafetyEquipmentTrigger(String trigger) {
        return SafetyViolationMapper.isSafetyEquipmentTrigger(trigger);
    }

    /**
     * 트리거가 중장비 관련인지 확인
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 중장비 관련 트리거인 경우 true
     */
    public static boolean isHeavyEquipmentTrigger(String trigger) {
        return HEAVY_EQUIPMENT_TRIGGERS.contains(trigger);
    }

    /**
     * 트리거의 장비 유형을 반환
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 장비 유형 (SAFETY_EQUIPMENT, HEAVY_EQUIPMENT, UNKNOWN)
     */
    public static EquipmentType getEquipmentType(String trigger) {
        if (isSafetyEquipmentTrigger(trigger)) {
            return EquipmentType.SAFETY_EQUIPMENT;
        } else if (isHeavyEquipmentTrigger(trigger)) {
            return EquipmentType.HEAVY_EQUIPMENT;
        } else {
            return EquipmentType.UNKNOWN;
        }
    }

    /**
     * 장비 유형 열거형
     */
    public enum EquipmentType {
        SAFETY_EQUIPMENT,  // 안전장비
        HEAVY_EQUIPMENT,   // 중장비
        UNKNOWN           // 알 수 없음
    }
}
