package watch.out.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

@Component
public class CookieUtil {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    // HttpOnly + Secure 쿠키 추가
    public void addHttpOnlyCookie(HttpServletResponse response, String name, String value,
        int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge / 1000); // 밀리초를 초로 변환, maxAge는 초 단위
        cookie.setHttpOnly(true);
        if (activeProfile.equalsIgnoreCase("prod")) {
            cookie.setSecure(true);
        }
        response.addCookie(cookie);
    }

    // 쿠키의 이름을 입력받아 쿠키 삭제
    public void deleteCookie(HttpServletRequest request, HttpServletResponse response,
        String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return;
        }

        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                cookie.setValue("");
                cookie.setPath("/");
                cookie.setMaxAge(0);
                response.addCookie(cookie);
            }
        }
    }

    public String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // 객체를 직렬화해 쿠키의 값으로 반환
    public String serialize(Object obj) {
        return Base64.getUrlEncoder()
            .encodeToString(SerializationUtils.serialize(obj));
    }

    // 쿠키를 역직렬화해 객체로 변환
    public <T> T deserialize(Cookie cookie, Class<T> cls) {
        return cls.cast(
            SerializationUtils.deserialize(
                Base64.getUrlDecoder().decode(cookie.getValue())
            )
        );
    }
}
