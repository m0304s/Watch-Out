package watch.out.common.util;

import watch.out.user.entity.BloodType;
import watch.out.user.entity.RhFactor;

/**
 * 혈액형 관련 유틸리티 클래스
 */
public class BloodTypeUtil {

    /**
     * 혈액형과 Rh 인자를 표준 형식으로 포맷팅
     *
     * @param bloodType 혈액형
     * @param rhFactor  Rh 인자
     * @return 포맷팅된 혈액형 문자열 (예: "A+", "B-")
     */
    public static String formatBloodType(BloodType bloodType, RhFactor rhFactor) {
        if (bloodType == null || rhFactor == null) {
            return "알 수 없음";
        }

        String rhSymbol = (rhFactor == RhFactor.PLUS) ? "+" : "-";
        return bloodType.name() + rhSymbol;
    }
}
