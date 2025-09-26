package watch.out.cctv.dto;

import java.util.Map;
import java.util.Set;

/**
 * 장비 분류 결과를 담는 레코드
 */
public record EquipmentClassification(
    Set<String> safetyEquipmentClasses,
    Map<String, Integer> heavyEquipmentDetections
) {

}
