package watch.out.s3.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "단일 파일 업로드 URL 요청 DTO")
public record ProfilePresignedUrlRequest(
    @NotBlank(message = "파일 이름은 비워둘 수 없습니다.")
    @Schema(description = "업로드할 파일의 전체 이름", example = "profile.jpg")
    String fileName
) {

}