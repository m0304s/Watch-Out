package watch.out.cctv.dto.request;

import java.util.UUID;

public record GetCctvRequest(
	UUID areaUuid,
	Boolean isOnline,
	String cctvName
) {

}
