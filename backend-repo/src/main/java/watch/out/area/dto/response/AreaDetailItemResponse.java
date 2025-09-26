package watch.out.area.dto.response;

import java.util.UUID;

public record AreaDetailItemResponse(
    UUID userUuid,
    String userName,
    String userId
) {

}
