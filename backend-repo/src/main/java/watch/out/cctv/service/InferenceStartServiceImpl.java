package watch.out.cctv.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import watch.out.cctv.dto.response.StartReportResponse;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.Type;
import watch.out.cctv.repository.CctvRepository;
import watch.out.cctv.util.FastapiClient;

import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InferenceStartServiceImpl implements InferenceStartService {

    private final CctvRepository cctvRepository;

    @Value("${fastapi.base-url:http://localhost:8000}")
    private String fastapiBaseUrl;

    @Value("${fastapi.http.connect-timeout-ms:5000}")
    private long connectTimeoutMs;

    @Value("${fastapi.http.read-timeout-ms:15000}")
    private long readTimeoutMs;

    private FastapiClient client() {
        return new FastapiClient(fastapiBaseUrl, connectTimeoutMs, readTimeoutMs);
    }

    @Override
    public StartReportResponse startAll(boolean mirror, boolean push) {
        List<StartReportResponse.Item> items = new ArrayList<>();
        for (Cctv cctv : cctvRepository.findByType(Type.CCTV)) {
            items.add(callDetectStart(cctv, mirror, push));
        }
        return new StartReportResponse(items);
    }

    @Override
    public StartReportResponse startArea(UUID areaUuid, boolean mirror, boolean push) {
        List<StartReportResponse.Item> items = new ArrayList<>();
        for (Cctv cctv : cctvRepository.findByAreaUuidAndType(areaUuid, Type.CCTV)) {
            items.add(callDetectStart(cctv, mirror, push));
        }
        return new StartReportResponse(items);
    }

    private StartReportResponse.Item callDetectStart(Cctv cctv, boolean mirror, boolean push) {
        String company = (cctv.getArea() != null && cctv.getArea().getUuid() != null)
            ? cctv.getArea().getUuid().toString()
            : "default";
        String camera = cctv.getCctvName();
        String src = cctv.getCctvUrl();

        try {
            HttpResponse<String> response =
                client().postDetectStart(company, camera, src, mirror, push);
            int status = response.statusCode();
            String body = response.body();
            log.info("[FastAPI] /detect/start -> {} body={}", status, body);

            String msg = (status >= 200 && status < 300)
                ? "started (fastapi ok)"
                : "fastapi error status=" + status;

            return new StartReportResponse.Item(cctv.getUuid(), camera, msg);
        } catch (Exception e) {
            log.error("[FastAPI] /detect/start failed for {} ({})", camera, src, e);
            return new StartReportResponse.Item(
                cctv.getUuid(), camera, "fastapi exception: " + e.getClass().getSimpleName());
        }
    }
}
