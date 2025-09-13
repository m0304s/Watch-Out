package watch.out.accident.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.accident.dto.response.AccidentDetailResponse;
import watch.out.accident.dto.response.AccidentListResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.repository.AccidentRepository;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;

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
    public List<AccidentDetailResponse> getAccidentsWithFilters(UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        return accidentRepository.findAccidentsWithFilters(areaUuid, accidentType, userUuid);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccidentListResponse> getAccidentList(PageRequest pageRequest,
        UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        // ADMIN은 모든 사고 조회 가능, AREA_ADMIN은 관리하는 구역의 사고만 조회
        if (SecurityUtil.isAdmin()) {
            List<AccidentListResponse> accidentList = accidentRepository.findAccidentList(
                pageRequest, areaUuid, accidentType, userUuid);
            long totalCount = accidentRepository.countAccidents(areaUuid, accidentType, userUuid);
            return PageResponse.of(accidentList, pageRequest.pageNum(), pageRequest.display(),
                totalCount);
        } else if (SecurityUtil.isAreaAdmin()) {
            return getAccidentListForManager(pageRequest, areaUuid, accidentType, userUuid);
        } else {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccidentListResponse> getAccidentListForManager(PageRequest pageRequest,
        UUID areaUuid,
        AccidentType accidentType, UUID userUuid) {
        UUID managerUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        List<AccidentListResponse> accidentList = accidentRepository.findAccidentListForManager(
            pageRequest, managerUuid, areaUuid, accidentType, userUuid);
        long totalCount = accidentRepository.countAccidentsForManager(
            managerUuid, areaUuid, accidentType, userUuid);

        return PageResponse.of(accidentList, pageRequest.pageNum(), pageRequest.display(),
            totalCount);
    }
}
