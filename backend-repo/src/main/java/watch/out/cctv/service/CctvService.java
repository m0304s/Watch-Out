package watch.out.cctv.service;

import watch.out.cctv.dto.response.CctvResponse;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.cctv.dto.request.CreateCctvRequest;
import watch.out.cctv.dto.request.UpdateCctvRequest;

import java.util.UUID;

public interface CctvService {

    void createCctv(CreateCctvRequest createCctvRequest);

    PageResponse<CctvResponse> getCctv(PageRequest pageRequest, UUID areaUuid, Boolean isOnline,
        String cctvName);

    CctvResponse updateCctv(UUID cctvUuid, UpdateCctvRequest updateCctvRequest);

    void deleteCctv(UUID cctvUuid);
}
