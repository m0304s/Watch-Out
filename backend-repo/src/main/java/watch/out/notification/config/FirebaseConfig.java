package watch.out.notification.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.IOException;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        try {
            InputStream serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("watchout-firebase-key.json");

            if (serviceAccount == null) {
                log.error("Firebase 서비스 계정 키 파일을 찾을 수 없습니다: watchout-firebase-key.json");
                return null;
            }

            // JSON에서 project_id 읽기
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(serviceAccount);
            String projectId = jsonNode.get("project_id").asText();

            log.info("JSON에서 읽은 project_id: {}", projectId);

            serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("watchout-firebase-key.json");
            
            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build();

            FirebaseApp app = FirebaseApp.initializeApp(options);
            log.info("Firebase 초기화 성공: project_id={}", options.getProjectId());
            return FirebaseMessaging.getInstance(app);

        } catch (IOException e) {
            log.error("Firebase 초기화 실패", e);
            return null;
        } catch (Exception e) {
            log.error("Firebase 초기화 중 예상치 못한 오류", e);
            return null;
        }
    }
}
