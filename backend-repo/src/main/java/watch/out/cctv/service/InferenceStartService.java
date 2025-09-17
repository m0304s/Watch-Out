package watch.out.cctv.service;

import java.util.List;
import java.util.UUID;

public interface InferenceStartService {

    StartReport startAll(boolean mirror, boolean push);

    StartReport startArea(UUID areaUuid, boolean mirror, boolean push);

    // 간단 DTO (레코드)
    record StartReport(List<Item> items) {

        public record Item(
            UUID uuid,
            String name,
            String message
        ) {

        }
    }
}
