package watch.out.cctv.service;

import watch.out.cctv.dto.response.AreaViewListResponse;
import watch.out.cctv.entity.Cctv;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StreamDirectoryService {

    Optional<Cctv> findOne(UUID uuid);

    List<AreaViewListResponse.Item> listAreaProxyItems(UUID areaUuid, boolean useFastapiMjpeg);

    default String springMjpegProxyUrl(Cctv cctv, boolean useFastapiMjpeg) {
        return "/cctv/stream/mjpeg?uuid=" + cctv.getUuid() + "&useFastapiMjpeg=" + useFastapiMjpeg;
    }

    default String fastapiMjpegUrl(Cctv cctv) {
        // 필요 시 FastAPI MJPEG URL 생성 규칙 맞춰서 수정
        return "http://localhost:8000/cctv?company="
            + (cctv.getArea() != null ? cctv.getArea().getUuid() : "default")
            + "&camera=" + urlEncode(cctv.getCctvName())
            + "&src=" + urlEncode(cctv.getCctvUrl());
    }

    private static String urlEncode(String s) {
        try {
            return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
