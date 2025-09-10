package watch.out.area.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;

    @Override
    @Transactional
    public void createArea(AreaRequest areaRequest) {
        Area area = Area.builder()
            .areaName(areaRequest.areaName())
            .areaAlias(areaRequest.areaAlias())
            .build();

        areaRepository.save(area);
    }
}
