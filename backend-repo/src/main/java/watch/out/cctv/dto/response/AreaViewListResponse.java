package watch.out.cctv.dto.response;

import java.util.List;
import java.util.UUID;

public record AreaViewListResponse(
    UUID areaUuid,
    boolean useFastapiMjpeg,
    List<Item> items
) {

    public record Item(
        UUID uuid,
        String name,
        String proxyUrl,
        String upstream,
        boolean online
    ) {

    }
}
