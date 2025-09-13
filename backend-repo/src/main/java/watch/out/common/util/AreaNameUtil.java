package watch.out.common.util;

/**
 * 구역 이름 포맷팅 유틸리티
 */
public class AreaNameUtil {

    private AreaNameUtil() {
        // Utility class
    }

    /**
     * 구역 이름과 별칭을 조합하여 포맷팅된 구역 이름을 반환
     *
     * @param areaName  구역 이름
     * @param areaAlias 구역 별칭 (null 가능)
     * @return 포맷팅된 구역 이름 (예: "A구역", "A구역 자재 하적장")
     */
    public static String formatAreaName(String areaName, String areaAlias) {
        if (areaName == null) {
            return "알 수 없음";
        }

        if (areaAlias == null || areaAlias.trim().isEmpty()) {
            return areaName;
        }

        return areaName + " " + areaAlias;
    }
}
