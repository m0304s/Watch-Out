package watch.out.accident.controller;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.service.AccidentService;

@RestController
@RequestMapping("/accident")
@RequiredArgsConstructor
public class AccidentController {

    private final AccidentService accidentService;

    @GetMapping("/{accidentUuid}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AREA_ADMIN')")
    public ResponseEntity<AccidentDetailResponse> getAccidentDetail(
        @PathVariable UUID accidentUuid) {
        AccidentDetailResponse response = accidentService.getAccidentDetail(accidentUuid);
        return ResponseEntity.ok(response);
    }
}
