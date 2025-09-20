package watch.out.area.dto.request;

import java.util.List;
import java.util.UUID;

public record CountWorkersRequest(
    List<UUID> areaUuids
) {

}
