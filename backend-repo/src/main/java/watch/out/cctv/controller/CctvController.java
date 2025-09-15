package watch.out.cctv.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import watch.out.cctv.dto.response.CctvResponse;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.cctv.dto.request.CreateCctvRequest;
import watch.out.cctv.dto.request.UpdateCctvRequest;
import watch.out.cctv.service.CctvService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cctv")
@PreAuthorize("hasAnyRole('ADMIN','AREA_ADMIN')")
@Validated
public class CctvController {

	private final CctvService cctvService;

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

		PageResponse<CctvResponse> cctv = cctvService.getCctv(PageRequest.of(pageNum, display),
			areaUuid, isOnline, search);
		return ResponseEntity.ok(cctv);
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
}
