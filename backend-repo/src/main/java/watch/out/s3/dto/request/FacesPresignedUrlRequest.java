package watch.out.s3.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

@Schema(description = "3개 파일 업로드 URL 요청 DTO")
public record FacesPresignedUrlRequest(
    @NotEmpty(message = "파일 이름 목록은 비워둘 수 없습니다.")
    @Size(min = 3, max = 3, message = "파일 이름은 정확히 3개여야 합니다.")
    @Schema(description = "업로드할 파일 3개의 이름 배열", example = "[\"front.jpg\", \"left.jpg\", \"right.jpg\"]")
    List<String> fileNames
) {

}