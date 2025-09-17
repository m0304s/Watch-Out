package watch.out.cctv.util;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
public class FastapiClient {

    private final HttpClient httpClient;
    private final String baseUrl;
    private final Duration connectTimeout;
    private final Duration readTimeout;

    public FastapiClient(String baseUrl, long connectTimeoutMs, long readTimeoutMs) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.connectTimeout = Duration.ofMillis(connectTimeoutMs);
        this.readTimeout = Duration.ofMillis(readTimeoutMs);
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(this.connectTimeout)
            .build();
    }

    private static String enc(String s) {
        return URLEncoder.encode(s == null ? "" : s, StandardCharsets.UTF_8);
    }

    public HttpResponse<String> postDetectStart(String company, String camera, String src,
        boolean mirror, boolean push)
        throws IOException, InterruptedException {

        // FastAPI: POST /detect/start?company=..&camera=..&src=..&mirror=..&push=..
        String url = String.format("%s/detect/start?company=%s&camera=%s&src=%s&mirror=%s&push=%s",
            baseUrl, enc(company), enc(camera), enc(src), mirror, push);

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(readTimeout)
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();

        log.info("[FastAPI] POST {}", url);
        return httpClient.send(req, HttpResponse.BodyHandlers.ofString());
    }

    public HttpResponse<String> postDetectStop(String company, String camera)
        throws IOException, InterruptedException {
        String url = String.format("%s/detect/stop?company=%s&camera=%s", baseUrl, enc(company),
            enc(camera));
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .timeout(readTimeout)
            .POST(HttpRequest.BodyPublishers.noBody())
            .build();
        log.info("[FastAPI] POST {}", url);
        return httpClient.send(req, HttpResponse.BodyHandlers.ofString());
    }
}
