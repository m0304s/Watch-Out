package watch.out.accident.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.repository.AccidentRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;

@Service
@RequiredArgsConstructor
public class AccidentServiceImpl implements AccidentService {

    private final AccidentRepository accidentRepository;

    @Override
    @Transactional(readOnly = true)
    public AccidentDetailResponse getAccidentDetail(UUID accidentUuid) {
        return accidentRepository.findAccidentDetailById(accidentUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccidentDetailResponse> getAccidentsByArea(UUID areaUuid) {
        return accidentRepository.findAccidentsByArea(areaUuid);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccidentDetailResponse> getAccidentsByType(AccidentType accidentType) {
        return accidentRepository.findAccidentsByType(accidentType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccidentDetailResponse> getAccidentsByUser(UUID userUuid) {
        return accidentRepository.findAccidentsByUser(userUuid);
    }
}
