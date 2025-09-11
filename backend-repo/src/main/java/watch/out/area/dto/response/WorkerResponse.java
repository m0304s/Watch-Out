package watch.out.area.dto.response;

import java.util.UUID;

public record WorkerResponse(
    UUID userUuid,
    String userName,
    String userId
) {

}
