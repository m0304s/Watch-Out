package watch.out.cctv.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import watch.out.cctv.dto.response.AreaViewResponse;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.Type;
import watch.out.cctv.repository.CctvRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreamDirectoryServiceImpl implements StreamDirectoryService {

    private final CctvRepository cctvRepository;

    @Value("${fastapi.base-url:http://localhost:8000}")
    private String fastapiBaseUrl;

    @Override
    public Optional<Cctv> findOne(UUID uuid) {
        return cctvRepository.findByUuidAndType(uuid, Type.CCTV);
    }

    @Override
    public List<AreaViewResponse> listAreaProxyItems(UUID areaUuid, boolean useFastapiMjpeg) {
        return cctvRepository.findByAreaUuidAndType(areaUuid, Type.CCTV)
            .stream()
            .map(cctv -> new AreaViewResponse(
                cctv.getUuid(),
                cctv.getCctvName(),
                springMjpegProxyUrl(cctv, useFastapiMjpeg),
                fastapiMjpegUrl(cctv),
                cctv.isOnline()
            ))
            .toList();
    }

    @Override
    public String springMjpegProxyUrl(Cctv cctv, boolean useFastapiMjpeg) {
        // 스프링 내부 프록시라 base-url 불필요
        return "/cctv/stream/mjpeg?uuid=" + cctv.getUuid()
            + "&useFastapiMjpeg=" + useFastapiMjpeg;
    }

    @Override
    public String fastapiMjpegUrl(Cctv cctv) {
        String company = (cctv.getArea() != null && cctv.getArea().getUuid() != null)
            ? cctv.getArea().getUuid().toString() : "default";
        String camera = cctv.getCctvName();
        String src = cctv.getCctvUrl();

        return fastapiBaseUrl
            + "/cctv?company=" + urlEncode(company)
            + "&camera=" + urlEncode(camera)
            + "&src=" + urlEncode(src);
    }

    private static String urlEncode(String s) {
        try {
            return URLEncoder.encode(s, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
}
