package watch.out.area.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.service.AreaService;

@RestController
@RequestMapping("/area")
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @PostMapping
    public ResponseEntity<Void> createArea(@Valid @RequestBody AreaRequest areaRequest) {
        areaService.createArea(areaRequest);
        return ResponseEntity.noContent().build();
    }
}
