package watch.out.dashboard.dto.request;

import java.util.List;
import java.util.UUID;

public record SafetyViolationStatusRequest(
    List<UUID> areaUuids
) {

}
