package watch.out;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class WatchOutApplication {

    
    public static void main(String[] args) {
        SpringApplication.run(WatchOutApplication.class, args);
    }

}
