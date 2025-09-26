package watch.out.area.dto.response;

/**
 * 구역 개수 응답 DTO
 */
public record AreaCountResponse(
    Long areaCount
) {

    public static AreaCountResponse of(Long areaCount) {
        return new AreaCountResponse(areaCount);
    }
}
