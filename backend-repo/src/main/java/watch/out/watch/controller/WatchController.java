package watch.out.watch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.watch.dto.request.CreateWatchRequest;
import watch.out.watch.dto.request.RentWatchRequest;
import watch.out.watch.dto.request.UpdateWatchRequest;
import watch.out.watch.dto.response.WatchDetailResponse;
import watch.out.watch.dto.response.WatchListResponse;
import watch.out.watch.service.WatchService;

import java.util.UUID;

@RestController
@RequestMapping("/watch")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')") // 워치 관리는 관리자만 가능
public class WatchController {

    private final WatchService watchService;

    @GetMapping
    public ResponseEntity<PageResponse<WatchListResponse>> getWatches(
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display) {
        PageRequest pageRequest = PageRequest.of(pageNum, display);
        PageResponse<WatchListResponse> response = watchService.getWatches(pageRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{watchUuid}")
    public ResponseEntity<WatchDetailResponse> getWatch(@PathVariable UUID watchUuid,
        @RequestParam(defaultValue = "0") int pageNum,
        @RequestParam(defaultValue = "10") int display) {
        PageRequest pageRequest = PageRequest.of(pageNum, display);
        WatchDetailResponse response = watchService.getWatch(watchUuid, pageRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> createWatch(
        @Valid @RequestBody CreateWatchRequest createWatchRequest) {
        watchService.createWatch(createWatchRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{watchUuid}")
    public ResponseEntity<Void> deleteWatch(@PathVariable UUID watchUuid) {
        watchService.deleteWatch(watchUuid);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{watchUuid}")
    public ResponseEntity<Void> updateWatch(@PathVariable UUID watchUuid,
        @Valid @RequestBody UpdateWatchRequest updateWatchRequest) {
        watchService.updateWatch(watchUuid, updateWatchRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{watchUuid}/rent")
    public ResponseEntity<Void> rentWatch(@PathVariable UUID watchUuid,
        @Valid @RequestBody RentWatchRequest rentWatchRequest) {
        watchService.rentWatch(watchUuid, rentWatchRequest);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{watchUuid}/return")
    public ResponseEntity<Void> returnWatch(@PathVariable UUID watchUuid) {
        watchService.returnWatch(watchUuid);
        return ResponseEntity.noContent().build();
    }
}
