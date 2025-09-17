package watch.out.cctv.dto.response;

import java.util.UUID;

public record AreaViewResponse(
    UUID uuid,
    String name,
    String springProxyUrl,
    String fastapiMjpegUrl,
    boolean online
) {

}
