package watch.out.cctv.dto.request;

import java.util.UUID;

public record StartReportRequest(
    UUID areaUuid,
    boolean mirror,
    boolean push
) {

}
