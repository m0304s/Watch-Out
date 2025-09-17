package watch.out.cctv.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import watch.out.cctv.dto.request.CreateCctvRequest;
import watch.out.cctv.dto.request.UpdateCctvRequest;
import watch.out.cctv.dto.response.AreaViewListResponse;
import watch.out.cctv.dto.response.CctvResponse;
import watch.out.cctv.dto.response.StartReportResponse;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.service.CctvService;
import watch.out.cctv.service.StreamDirectoryService;
import watch.out.cctv.service.InferenceStartService;
import watch.out.cctv.util.MjpegStreaming;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cctv")
@PreAuthorize("hasAnyRole('ADMIN','AREA_ADMIN')")
@Validated
public class CctvController {

    private final CctvService cctvService;
    private final StreamDirectoryService streamDirectoryService;
    private final InferenceStartService inferenceStartService;

    @PostMapping
    public ResponseEntity<Void> createCctv(@Valid @RequestBody CreateCctvRequest request) {
        cctvService.createCctv(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<PageResponse<CctvResponse>> getCctv(
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display,
        @RequestParam(required = false) UUID areaUuid,
        @RequestParam(required = false) Boolean isOnline,
        @RequestParam(required = false) String search
    ) {
        PageResponse<CctvResponse> page =
            cctvService.getCctv(PageRequest.of(pageNum, display), areaUuid, isOnline, search);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{cctvUuid}")
    public ResponseEntity<CctvResponse> updateCctv(@PathVariable UUID cctvUuid,
        @RequestBody UpdateCctvRequest request) {
        CctvResponse cctvResponse = cctvService.updateCctv(cctvUuid, request);
        return ResponseEntity.ok(cctvResponse);
    }

    @DeleteMapping("/{cctvUuid}")
    public ResponseEntity<Void> deleteCctv(@PathVariable UUID cctvUuid) {
        cctvService.deleteCctv(cctvUuid);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/views/area")
    @PreAuthorize("hasAnyRole('ADMIN','AREA_ADMIN')")
    public ResponseEntity<AreaViewListResponse> areaViews(
        @RequestParam UUID areaUuid,
        @RequestParam(defaultValue = "false") boolean useFastapiMjpeg
    ) {
        AreaViewListResponse body = new AreaViewListResponse(
            areaUuid,
            useFastapiMjpeg,
            streamDirectoryService.listAreaProxyItems(areaUuid, useFastapiMjpeg)
        );
        return ResponseEntity.ok(body);
    }

    @GetMapping(value = "/stream/mjpeg", produces = "multipart/x-mixed-replace; boundary=frame")
    @PreAuthorize("hasAnyRole('ADMIN','AREA_ADMIN')")
    public void streamOne(
        @RequestParam UUID uuid,
        @RequestParam(defaultValue = "false") boolean useFastapiMjpeg,
        HttpServletResponse response
    ) throws IOException {
        Cctv cctv = streamDirectoryService.findOne(uuid)
            .orElseThrow(() -> new IllegalArgumentException("CCTV not found or not type=CCTV"));
        if (useFastapiMjpeg) {
            MjpegStreaming.proxyUpstreamMultipart(streamDirectoryService.fastapiMjpegUrl(cctv), response);
        } else {
            Process process = MjpegStreaming.transcodeToMjpegAndStream(cctv.getCctvUrl(), response);
            // ⚠️ 여길 즉시 destroy 하면 바로 끊김. (원래는 클라이언트 종료 시 정리 로직에서 종료)
        }
    }

    @PostMapping("/infer/start-all")
    public ResponseEntity<StartReportResponse> startAll(
        @RequestParam(defaultValue = "true") boolean mirror,
        @RequestParam(defaultValue = "false") boolean push
    ) {
        return ResponseEntity.ok(inferenceStartService.startAll(mirror, push));
    }

    @PostMapping("/infer/start-area")
    public ResponseEntity<StartReportResponse> startArea(   // ✅ 통일
        @RequestParam UUID areaUuid,
        @RequestParam(defaultValue = "true") boolean mirror,
        @RequestParam(defaultValue = "false") boolean push
    ) {
        return ResponseEntity.ok(inferenceStartService.startArea(areaUuid, mirror, push));
    }
}
