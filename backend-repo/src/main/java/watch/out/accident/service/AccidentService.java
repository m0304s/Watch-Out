package watch.out.accident.service;

import java.util.List;
import java.util.UUID;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.entity.AccidentType;

public interface AccidentService {

    AccidentDetailResponse getAccidentDetail(UUID accidentUuid);

    List<AccidentDetailResponse> getAccidentsWithFilters(UUID areaUuid, AccidentType accidentType,
        UUID userUuid);
}
