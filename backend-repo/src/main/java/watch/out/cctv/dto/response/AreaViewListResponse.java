package watch.out.cctv.dto.response;

import java.util.List;
import java.util.UUID;

public record AreaViewListResponse(
    UUID areaUuid,
    boolean useFastapiMjpeg,
    List<AreaViewResponse> items
) {

}
