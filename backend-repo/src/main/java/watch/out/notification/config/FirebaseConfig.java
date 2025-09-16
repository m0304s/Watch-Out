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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.service-account-file:/app/config/watchout-firebase-key.json}")
    private String serviceAccountFilePath;

    @Bean
    public FirebaseMessaging firebaseMessaging() {
        try {
            log.info("Firebase 서비스 계정 키 파일 경로: {}", serviceAccountFilePath);
            
            // 외부 파일에서 읽기
            try (InputStream serviceAccount = new java.io.FileInputStream(serviceAccountFilePath)) {
                // JSON에서 project_id 읽기
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(serviceAccount);
                String projectId = jsonNode.get("project_id").asText();

                log.info("JSON에서 읽은 project_id: {}", projectId);

                // 다시 파일을 열어서 credentials 생성
                try (InputStream credentialsStream = new java.io.FileInputStream(serviceAccountFilePath)) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);

                    FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setProjectId(projectId)
                        .build();

                    FirebaseApp app = FirebaseApp.initializeApp(options);
                    log.info("Firebase 초기화 성공: project_id={}", projectId);
                    return FirebaseMessaging.getInstance(app);
                }
            }

        } catch (IOException e) {
            log.error("Firebase 초기화 실패: {}", serviceAccountFilePath, e);
            return null;
        } catch (Exception e) {
            log.error("Firebase 초기화 중 예상치 못한 오류", e);
            return null;
        }
    }
}
