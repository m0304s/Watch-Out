package watch.out.watch.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RentWatchRequest(
    @NotNull(message = "사용자 UUID는 필수입니다.")
    UUID userUuid
) {

}
