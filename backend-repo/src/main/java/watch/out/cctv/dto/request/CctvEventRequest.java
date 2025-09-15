package watch.out.cctv.dto.request;

import java.util.List;
import java.util.Map;

public record CctvEventRequest(

	String ts,
	String src,
	String company,
	String camera,
	String snapshot,
	List<String> triggers,
	Map<String, Integer> detections,
	String eventId
) {

}
