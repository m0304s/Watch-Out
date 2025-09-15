package watch.out.accident.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.accident.dto.request.AccidentReportRequest;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.dto.response.AccidentReportResponse;
import watch.out.accident.dto.response.AreaInfo;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.accident.dto.response.WorkerInfo;
import watch.out.accident.entity.Accident;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.repository.AccidentRepository;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.user.entity.User;
import watch.out.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AccidentServiceImpl implements AccidentService {

    private final AccidentRepository accidentRepository;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;

    @Override
    @Transactional(readOnly = true)
    public AccidentResponse getAccident(UUID accidentUuid) {
        // 현재 사용자 정보 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        // 사고 상세 정보 조회
        AccidentResponse accidentDetail = accidentRepository.findAccidentDetailById(
                accidentUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 권한 검증
        if (SecurityUtil.isAdmin()) {
            // ADMIN은 모든 사고 조회 가능
            return accidentDetail;
        } else if (SecurityUtil.isAreaAdmin()) {
            // AREA_ADMIN은 자신이 담당하는 구역의 사고만 조회 가능
            UserWithAreaDto userWithArea = userRepository.findUserWithAreaById(currentUserUuid)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

            if (!userWithArea.hasAssignedArea()) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }

            // 사고가 발생한 구역이 현재 사용자가 담당하는 구역인지 확인
            if (!accidentDetail.areaInfo().areaUuid().equals(userWithArea.areaUuid())) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }

            return accidentDetail;
        } else {
            // WORKER는 사고 상세 조회 권한 없음
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccidentsResponse> getAccidents(PageRequest pageRequest,
        UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate) {
        // 현재 사용자 정보 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        // ADMIN은 모든 사고 조회 가능, AREA_ADMIN은 관리하는 구역의 사고만 조회
        if (SecurityUtil.isAdmin()) {
            List<AccidentsResponse> accidentList = accidentRepository.findAccidentList(
                pageRequest, areaUuid, accidentType, userUuid, startDate, endDate);
            long totalCount = accidentRepository.countAccidents(areaUuid, accidentType, userUuid,
                startDate, endDate);
            return PageResponse.of(accidentList, pageRequest.pageNum(), pageRequest.display(),
                totalCount);
        } else if (SecurityUtil.isAreaAdmin()) {
            return getAccidentListForManager(pageRequest, areaUuid, accidentType, userUuid,
                startDate, endDate);
        } else {
            // WORKER는 사고 목록 조회 권한 없음
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AccidentsResponse> getAccidentListForManager(PageRequest pageRequest,
        UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate) {
        UUID managerUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        List<AccidentsResponse> accidentList = accidentRepository.findAccidentListForManager(
            pageRequest, managerUuid, areaUuid, accidentType, userUuid, startDate, endDate);
        long totalCount = accidentRepository.countAccidentsForManager(
            managerUuid, areaUuid, accidentType, userUuid, startDate, endDate);

        return PageResponse.of(accidentList, pageRequest.pageNum(), pageRequest.display(),
            totalCount);
    }

    @Override
    @Transactional
    public AccidentReportResponse reportAccident(AccidentReportRequest request) {
        // 현재 사용자 정보 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        UserWithAreaDto userWithArea = userRepository.findUserWithAreaById(currentUserUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 사용자가 배정받은 구역 확인
        if (!userWithArea.hasAssignedArea()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 사고 엔티티 생성을 위해 엔티티 조회
        User currentUser = userRepository.findById(userWithArea.userUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        Area area = areaRepository.findById(userWithArea.areaUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 사고 엔티티 생성 및 저장
        Accident accident = Accident.builder()
            .type(request.accidentType())
            .area(area)
            .user(currentUser)
            .build();

        Accident savedAccident = accidentRepository.save(accident);

        // 응답 DTO 생성
        AreaInfo areaInfo = AreaInfo.of(
            userWithArea.areaUuid(),
            userWithArea.getFormattedAreaName()
        );

        WorkerInfo workerInfo = WorkerInfo.of(
            userWithArea.userId(),
            userWithArea.userName(),
            userWithArea.companyName()
        );

        return AccidentReportResponse.of(
            savedAccident.getUuid().toString(),
            savedAccident.getType().getDescription(),
            savedAccident.getCreatedAt(),
            areaInfo,
            workerInfo
        );
    }
}