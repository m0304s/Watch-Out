package watch.out.cctv.dto.request;

public record EntryExitEventRequest(

    String userUuid,
    String areaUuid,
    String eventType,
    String timestamp
) {

}