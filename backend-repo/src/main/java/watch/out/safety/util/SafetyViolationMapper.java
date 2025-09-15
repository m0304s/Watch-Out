package watch.out.safety.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import watch.out.safety.entity.SafetyViolationType;

/**
 * AI 트리거 문자열을 SafetyViolationType enum으로 매핑하는 유틸리티
 */
public class SafetyViolationMapper {

    private static final Map<String, SafetyViolationType> TRIGGER_MAPPING = Map.of(
        "Helmet on", SafetyViolationType.HELMET_ON,
        "Helmet off", SafetyViolationType.HELMET_OFF,
        "Belt on", SafetyViolationType.BELT_ON,
        "Belt off", SafetyViolationType.BELT_OFF,
        "Hook on", SafetyViolationType.HOOK_ON,
        "Hook off", SafetyViolationType.HOOK_OFF,
        "Shoes on", SafetyViolationType.SHOES_ON,
        "Shoes off", SafetyViolationType.SHOES_OFF
    );

    /**
     * AI 트리거 문자열을 SafetyViolationType으로 변환
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return SafetyViolationType enum, 매핑되지 않은 경우 null
     */
    public static SafetyViolationType mapTriggerToViolationType(String trigger) {
        return TRIGGER_MAPPING.get(trigger);
    }

    /**
     * 안전장비 관련 트리거인지 확인
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 안전장비 관련 트리거인 경우 true
     */
    public static boolean isSafetyEquipmentTrigger(String trigger) {
        return TRIGGER_MAPPING.containsKey(trigger);
    }

    /**
     * 여러 위반 유형을 조합하여 적절한 SafetyViolationType을 반환
     *
     * @param violationTypes 위반 유형 리스트
     * @return 조합된 SafetyViolationType
     */
    public static SafetyViolationType mapViolationTypesToCombined(
        List<SafetyViolationType> violationTypes) {
        if (violationTypes == null || violationTypes.isEmpty()) {
            return null;
        }

        // 단일 위반인 경우
        if (violationTypes.size() == 1) {
            return violationTypes.get(0);
        }

        // 복합 위반인 경우 - 위반 유형들을 정렬하여 조합 키 생성
        List<String> sortedTypes = new ArrayList<>();
        for (SafetyViolationType type : violationTypes) {
            if (type.name().endsWith("_OFF")) {
                sortedTypes.add(type.name());
            }
        }
        Collections.sort(sortedTypes);

        // 조합 키 생성
        String combinedKey = String.join("_", sortedTypes);

        // ENUM에서 해당 조합 찾기
        try {
            return SafetyViolationType.valueOf(combinedKey);
        } catch (IllegalArgumentException e) {
            // 조합이 ENUM에 없는 경우, 첫 번째 위반 유형 반환
            return violationTypes.get(0);
        }
    }

    /**
     * 감지된 트리거들에서 안전장비 위반 유형들을 추출
     *
     * @param detectedClasses 감지된 클래스들
     * @return 안전장비 위반 유형 리스트
     */
    public static List<SafetyViolationType> extractSafetyViolationTypes(
        Set<String> detectedClasses) {
        List<SafetyViolationType> violations = new ArrayList<>();

        for (String detectedClass : detectedClasses) {
            SafetyViolationType violationType = mapTriggerToViolationType(detectedClass);
            if (violationType != null && violationType.name().endsWith("_OFF")) {
                violations.add(violationType);
            }
        }

        return violations;
    }
}
