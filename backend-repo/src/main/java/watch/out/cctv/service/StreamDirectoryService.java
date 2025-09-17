package watch.out.cctv.service;

import watch.out.cctv.dto.response.AreaViewResponse;
import watch.out.cctv.entity.Cctv;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StreamDirectoryService {

    Optional<Cctv> findOne(UUID uuid);

    List<AreaViewResponse> listAreaProxyItems(UUID areaUuid, boolean useFastapiMjpeg);

    // URL 빌더도 Impl로 내린다 (환경설정 사용)
    String springMjpegProxyUrl(Cctv cctv, boolean useFastapiMjpeg);

    String fastapiMjpegUrl(Cctv cctv);
}
