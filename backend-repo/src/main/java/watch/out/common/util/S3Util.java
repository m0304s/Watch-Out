package watch.out.common.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class S3Util {

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * S3 객체 키를 전체 URL로 변환합니다.
     *
     * @param key S3 객체 키 (예: "profile/uuid.jpg")
     * @return 전체 S3 URL
     */
    public String keyToUrl(String key) {
        if (key == null || key.isBlank()) {
            return null;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }

    /**
     * 전체 S3 URL을 객체 키로 변환합니다.
     *
     * @param url 전체 S3 URL
     * @return S3 객체 키 (URL이 유효하지 않으면 null 반환)
     */
    public String urlToKey(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String baseUrl = String.format("https://%s.s3.%s.amazonaws.com/", bucket, region);
        if (url.startsWith(baseUrl)) {
            String key = url.substring(baseUrl.length());
            // URL 인코딩된 문자가 있을 수 있으므로 디코딩
            return URLDecoder.decode(key, StandardCharsets.UTF_8);
        }
        return null; // 유효하지 않은 S3 URL 형식일 때 null 반환
    }
}
