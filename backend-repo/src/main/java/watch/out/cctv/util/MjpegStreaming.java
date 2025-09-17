package watch.out.cctv.util;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

@Slf4j
public class MjpegStreaming {

    private static final String BOUNDARY = "frame";

    /**
     * Upstream(이미 MJPEG 멀티파트)을 그대로 릴레이
     */
    public static void proxyUpstreamMultipart(String upstreamUrl, HttpServletResponse resp)
        throws IOException {
        log.info("Proxy MJPEG from {}", upstreamUrl);
        URL url = UriComponentsBuilder.fromHttpUrl(upstreamUrl).build(true).toUri().toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestProperty("Accept", "multipart/x-mixed-replace");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(0);

        int code = conn.getResponseCode();
        if (code / 100 != 2) {
            throw new IOException("Upstream HTTP " + code);
        }

        String contentType = conn.getHeaderField("Content-Type");
        if (contentType == null || !contentType.toLowerCase()
            .contains("multipart/x-mixed-replace")) {
            contentType = "multipart/x-mixed-replace; boundary=" + BOUNDARY;
        }

        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        resp.setHeader(HttpHeaders.PRAGMA, "no-cache");
        resp.setHeader(HttpHeaders.EXPIRES, "0");
        resp.setHeader(HttpHeaders.CONTENT_TYPE, contentType);

        try (InputStream in = conn.getInputStream();
            OutputStream out = resp.getOutputStream()) {
            in.transferTo(out);
        } finally {
            conn.disconnect();
        }
    }

    public static Process transcodeToMjpegAndStream(String inputUrl, HttpServletResponse resp)
        throws IOException {
        log.info("FFmpeg transcode -> MJPEG pipe from {}", inputUrl);
        ProcessBuilder processBuilder = new ProcessBuilder(
            "ffmpeg",
            "-rw_timeout", "15000000",
            "-fflags", "nobuffer",
            "-flags", "low_delay",
            "-rtsp_transport", "tcp",
            "-reconnect", "1",
            "-reconnect_streamed", "1",
            "-reconnect_delay_max", "2",
            "-i", inputUrl,
            "-f", "mjpeg",
            "-q:v", "5",
            "pipe:1"
        );
        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setHeader(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate");
        resp.setHeader(HttpHeaders.PRAGMA, "no-cache");
        resp.setHeader(HttpHeaders.EXPIRES, "0");
        resp.setHeader(HttpHeaders.CONTENT_TYPE, "multipart/x-mixed-replace; boundary=" + BOUNDARY);

        try (InputStream ffIn = process.getInputStream(); OutputStream out = resp.getOutputStream()) {
            writeMultipartFromJpegStream(ffIn, out);
        } catch (IOException e) {
            log.warn("Client disconnected or IO error: {}", e.getMessage());
        }
        return process;
    }

    private static void writeMultipartFromJpegStream(InputStream in, OutputStream out)
        throws IOException {
        final int FF = 0xFF, SOI = 0xD8, EOI = 0xD9;
        int prev = -1;
        boolean inFrame = false;
        ByteArrayOutputStream frame = new ByteArrayOutputStream(1 << 20);
        byte[] buf = new byte[8192];
        int n;

        while ((n = in.read(buf)) != -1) {
            for (int i = 0; i < n; i++) {
                int b = buf[i] & 0xFF;

                if (!inFrame) {
                    if (prev == FF && b == SOI) {
                        frame.reset();
                        frame.write(FF);
                        frame.write(SOI);
                        inFrame = true;
                        prev = -1;
                        continue;
                    }
                } else {
                    frame.write(b);
                    if (prev == FF && b == EOI) {
                        writePart(out, frame.toByteArray());
                        frame.reset();
                        inFrame = false;
                        prev = -1;
                        continue;
                    }
                }
                prev = b;
            }
        }
    }

    private static void writePart(OutputStream out, byte[] jpeg) throws IOException {
        out.write(("--" + BOUNDARY + "\r\n").getBytes());
        out.write(("Content-Type: image/jpeg\r\n").getBytes());
        out.write(("Content-Length: " + jpeg.length + "\r\n\r\n").getBytes());
        out.write(jpeg);
        out.write("\r\n".getBytes());
        out.flush();
    }
}
