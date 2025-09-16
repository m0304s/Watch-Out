package watch.out.notification.dto;

import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FcmMessage {

    private String title;
    private String body;
    private String clickAction;
    private Map<String, String> data;
}
