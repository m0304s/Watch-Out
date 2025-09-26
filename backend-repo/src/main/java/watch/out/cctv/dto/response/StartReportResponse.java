package watch.out.cctv.dto.response;

import java.util.List;
import java.util.UUID;

public record StartReportResponse(
    List<Item> items
) {

    public record Item(
        UUID uuid,
        String name,
        String message
    ) {

    }
}
