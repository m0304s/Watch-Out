package watch.out.safety.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.repository.CctvRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.safety.entity.SafetyViolation;
import watch.out.safety.entity.SafetyViolationType;
import watch.out.safety.repository.SafetyViolationRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class SafetyViolationServiceImpl implements SafetyViolationService {

    private final SafetyViolationRepository safetyViolationRepository;
    private final CctvRepository cctvRepository;
    private final AreaRepository areaRepository;
    private final ObjectMapper objectMapper;

    @Override
    public SafetyViolation saveViolation(UUID cctvUuid, UUID areaUuid,
        SafetyViolationType violationType, String imageKey) {
        // CCTV 엔티티 조회
        Cctv cctv = cctvRepository.findById(cctvUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // Area 엔티티 조회
        Area area = areaRepository.findById(areaUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // SafetyViolation 엔티티 생성 및 저장
        SafetyViolation safetyViolation = SafetyViolation.builder()
            .type(violationType)
            .imageKey(imageKey)
            .cctv(cctv)
            .area(area)
            .build();

        return safetyViolationRepository.save(safetyViolation);
    }
}
