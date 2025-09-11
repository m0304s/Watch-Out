package watch.out.area.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.service.AreaService;
import watch.out.common.dto.PageRequest;

@RestController
@RequestMapping("/area")
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createArea(@Valid @RequestBody AreaRequest areaRequest) {
        areaService.createArea(areaRequest);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<List<AreaListResponse>> getAreas() {
        List<AreaListResponse> areaListResponse = areaService.getAreas();
        return ResponseEntity.ok(areaListResponse);
    }

    @GetMapping("/{areaUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<AreaDetailResponse> getArea(
        @PathVariable UUID areaUuid,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        AreaDetailResponse areaDetailResponse = areaService.getArea(areaUuid, pageRequest);
        return ResponseEntity.ok(areaDetailResponse);
    }

    @PutMapping("/{areaUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<Void> updateArea(
        @PathVariable UUID areaUuid,
        @Valid @RequestBody AreaRequest areaRequest) {
        areaService.updateArea(areaUuid, areaRequest);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{areaUuid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteArea(@PathVariable UUID areaUuid) {
        areaService.deleteArea(areaUuid);
        return ResponseEntity.noContent().build();
    }
}
