package watch.out.s3.service;

import watch.out.s3.dto.request.FacesPresignedUrlRequest;
import watch.out.s3.dto.request.ProfilePresignedUrlRequest;
import watch.out.s3.dto.response.PresignedUrlResponse;
import java.util.List;

public interface S3Service {

    PresignedUrlResponse generateProfilePresignedUrl(ProfilePresignedUrlRequest request);

    List<PresignedUrlResponse> generateFacesPresignedUrls(FacesPresignedUrlRequest request,
        String userUuid);
}