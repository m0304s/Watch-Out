package watch.out.area.dto.response;

import java.util.UUID;

public record AreaWorkerResponse(
    UUID areaUuid,
    String areaName,
    long nowWorkers,
    long allWorkers
) {

}
