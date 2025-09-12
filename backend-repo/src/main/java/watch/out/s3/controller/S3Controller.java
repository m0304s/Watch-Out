package watch.out.s3.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.s3.dto.request.FacesPresignedUrlRequest;
import watch.out.s3.dto.request.ProfilePresignedUrlRequest;
import watch.out.s3.dto.response.PresignedUrlResponse;
import watch.out.s3.service.S3Service;

import java.util.List;

@RestController
@RequestMapping("/s3")
@RequiredArgsConstructor
@Tag(name = "S3 Presigned URL", description = "S3 파일 업로드를 위한 Pre-signed URL 생성 API")
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/photo/presigned-url")
    @Operation(summary = "프로필 사진 업로드 URL 생성", description = "단일 프로필 사진을 업로드하기 위한 Pre-signed URL을 생성합니다.")
    public ResponseEntity<PresignedUrlResponse> getProfilePresignedUrl(
        @Valid @RequestBody ProfilePresignedUrlRequest request) {
        PresignedUrlResponse response = s3Service.generateProfilePresignedUrl(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/faces/presigned-url")
    @Operation(summary = "안면 인식용 사진 업로드 URL 생성 (3장)", description = "안면 인식에 필요한 3장의 사진을 업로드하기 위한 Pre-signed URL들을 생성합니다.")
    public ResponseEntity<List<PresignedUrlResponse>> getFacesPresignedUrls(
        @Valid @RequestBody FacesPresignedUrlRequest request
    ) {

        String userUuid = SecurityUtil.getCurrentUserUuid()
            .map(UUID::toString)
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        List<PresignedUrlResponse> responses = s3Service.generateFacesPresignedUrls(request, userUuid);

        return ResponseEntity.ok(responses);
    }
}