package watch.out.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @NotBlank
    @Size(min = 7, max = 7)
    String userId,
    @NotBlank
    @Size(min = 8, max = 16)
    String password
) {}
