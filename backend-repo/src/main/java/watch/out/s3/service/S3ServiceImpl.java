package watch.out.s3.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.s3.dto.request.FacesPresignedUrlRequest;
import watch.out.s3.dto.request.ProfilePresignedUrlRequest;
import watch.out.s3.dto.response.PresignedUrlResponse;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    private static final Map<String, String> ALLOWED_MIME_TYPES = Map.of(
        ".jpg", "image/jpeg",
        ".jpeg", "image/jpeg",
        ".png", "image/png"
    );

    @Override
    public PresignedUrlResponse generateProfilePresignedUrl(ProfilePresignedUrlRequest request) {
        String fileName = request.fileName();
        String extension = extractExtension(fileName);
        String contentType = getContentTypeByExtension(extension);
        String s3Key = "profile/" + UUID.randomUUID() + extension;
        return generatePresignedUrl(s3Key, contentType);
    }

    @Override
    public List<PresignedUrlResponse> generateFacesPresignedUrls(FacesPresignedUrlRequest request,
        String userUuid) {
        String batchId = UUID.randomUUID().toString();
        return request.fileNames().stream()
            .map(fileName -> {
                String extension = extractExtension(fileName);
                String contentType = getContentTypeByExtension(extension);
                String s3Key = "faces/" + userUuid + "/" + batchId + "/" + fileName;
                return generatePresignedUrl(s3Key, contentType);
            })
            .collect(Collectors.toList());
    }

    private PresignedUrlResponse generatePresignedUrl(String s3Key, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(s3Key)
            .contentType(contentType)
            .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10))
            .putObjectRequest(putObjectRequest)
            .build();

        String uploadUrl = s3Presigner.presignPutObject(presignRequest).url().toString();

        String fileUrl = s3Client.utilities().getUrl(GetUrlRequest.builder()
            .bucket(bucketName)
            .key(s3Key)
            .build()).toExternalForm();

        return new PresignedUrlResponse(uploadUrl, fileUrl);
    }

    private String getContentTypeByExtension(String extension) {
        String contentType = ALLOWED_MIME_TYPES.get(extension.toLowerCase());
        if (contentType == null) {
            throw new BusinessException(ErrorCode.INVALID_FILE_NAME);
        }
        return contentType;
    }

    private String extractExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf("."));
        } catch (StringIndexOutOfBoundsException e) {
            throw new BusinessException(ErrorCode.INVALID_FILE_NAME);
        }
    }
}