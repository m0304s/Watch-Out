package watch.out.s3.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Pre-signed URL 응답 DTO")
public record PresignedUrlResponse(
    @Schema(description = "파일을 직접 업로드할 때 사용하는 Pre-signed URL")
    String uploadUrl,

    @Schema(description = "업로드 완료 후 파일에 접근할 수 있는 S3 URL")
    String fileUrl
) {

}