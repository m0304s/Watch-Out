package watch.out.cctv.service;

import java.util.UUID;
import watch.out.cctv.dto.response.StartReportResponse;

public interface InferenceStartService {

    StartReportResponse startAll(boolean mirror, boolean push);

    StartReportResponse startArea(UUID areaUuid, boolean mirror, boolean push);

}
