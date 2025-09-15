package watch.out.area.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.dto.request.AreaRequest;
import watch.out.area.dto.response.AreaCountResponse;
import watch.out.area.dto.response.AreaDetailResponse;
import watch.out.area.dto.response.AreaListResponse;
import watch.out.area.dto.response.AreaDetailItemResponse;
import watch.out.common.dto.PageResponse;
import watch.out.area.entity.Area;
import watch.out.area.entity.AreaManager;
import watch.out.area.repository.AreaManagerRepository;
import watch.out.area.repository.AreaRepository;
import watch.out.common.dto.PageRequest;
import watch.out.user.repository.UserRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final AreaManagerRepository areaManagerRepository;
    private final UserRepository userRepository;

    /**
     * 구역 접근 권한을 확인합니다.
     *
     * @param areaUuid 접근하려는 구역의 UUID
     * @throws BusinessException 권한이 없는 경우 PERMISSION_DENIED 예외 발생
     */
    private void validateAreaAccess(UUID areaUuid) {
        Optional<UserRole> currentUserRole = SecurityUtil.getCurrentUserRole();

        if (currentUserRole.isEmpty()) {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }

        UserRole role = currentUserRole.get();

        if (role == UserRole.ADMIN) {
            // ADMIN은 모든 구역에 접근 가능
            return;
        } else if (role == UserRole.AREA_ADMIN) {
            // AREA_ADMIN은 자신이 배정된 구역만 접근 가능
            Optional<UUID> currentUserUuid = SecurityUtil.getCurrentUserUuid();
            if (currentUserUuid.isEmpty()) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }

            boolean hasAccess = areaRepository.hasAreaAccess(currentUserUuid.get(), areaUuid);
            if (!hasAccess) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }
        } else {
            // WORKER는 구역 접근 불가
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }

    @Override
    @Transactional
    public void createArea(AreaRequest areaRequest) {
        // 관리자 유효성 검증
        User manager = userRepository.findById(areaRequest.managerUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (manager.getRole() != UserRole.AREA_ADMIN) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 구역 생성
        Area area = Area.builder()
            .areaName(areaRequest.areaName())
            .areaAlias(areaRequest.areaAlias())
            .build();

        Area savedArea = areaRepository.save(area);

        // 구역 관리자 관계 생성
        AreaManager areaManager = AreaManager.builder()
            .area(savedArea)
            .user(manager)
            .build();

        areaManagerRepository.save(areaManager);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AreaListResponse> getAreas(PageRequest pageRequest, String search) {
        Optional<UserRole> currentUserRole = SecurityUtil.getCurrentUserRole();

        if (currentUserRole.isEmpty()) {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }

        UserRole role = currentUserRole.get();

        int pageNum = pageRequest.pageNum();
        int display = pageRequest.display();

        // 검색어 정규화 (null이거나 빈 문자열인 경우 null로 처리)
        String searchTerm = (search == null || search.trim().isEmpty()) ? null : search.trim();

        List<AreaListResponse> areas;
        long totalItems;

        if (role == UserRole.ADMIN) {
            // ADMIN은 모든 구역 조회
            areas = areaRepository.findAreasAsDto(pageNum, display, searchTerm);
            totalItems = areaRepository.countAreas(searchTerm);
        } else if (role == UserRole.AREA_ADMIN) {
            // AREA_ADMIN은 자신이 배정된 구역만 조회
            Optional<UUID> currentUserUuid = SecurityUtil.getCurrentUserUuid();
            if (currentUserUuid.isEmpty()) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }

            areas = areaRepository.findAreasByUserUuidAsDto(currentUserUuid.get(), pageNum, display,
                searchTerm);
            totalItems = areaRepository.countAreasByUserUuid(currentUserUuid.get(), searchTerm);
        } else {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }

        return PageResponse.of(areas, pageNum, display, totalItems);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaDetailResponse getArea(UUID areaUuid, PageRequest pageRequest) {
        // 권한 확인
        validateAreaAccess(areaUuid);

        // 구역 상세 정보 조회
        AreaDetailResponse areaDetail = areaRepository.findAreaDetailAsDto(areaUuid);
        if (areaDetail == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        // 관리자가 없는 경우 예외 발생
        if (areaDetail.managerUuid() == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        // 작업자 목록 조회 (작업자가 없을 수도 있음)
        int offset = pageRequest.pageNum() * pageRequest.display();
        List<AreaDetailItemResponse> workers = areaRepository.findWorkersByAreaUuidAsDto(areaUuid,
            offset,
            pageRequest.display());
        long totalWorkers = areaRepository.countWorkersByAreaUuid(areaUuid);

        // 페이지네이션 정보 생성 (작업자가 없어도 빈 배열로 반환)
        PageResponse<AreaDetailItemResponse> workersPage = PageResponse.of(
            workers,
            pageRequest.pageNum(),
            pageRequest.display(),
            totalWorkers
        );

        return new AreaDetailResponse(
            areaDetail.areaUuid(),
            areaDetail.areaName(),
            areaDetail.areaAlias(),
            areaDetail.managerUuid(),
            areaDetail.managerName(),
            workersPage
        );
    }

    @Override
    @Transactional
    public void updateArea(UUID areaUuid, AreaRequest areaRequest) {
        // 권한 확인
        validateAreaAccess(areaUuid);

        Area area = areaRepository.findById(areaUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 구역 정보 수정
        area.updateArea(areaRequest.areaName(), areaRequest.areaAlias());

        // 관리자 변경 처리
        User newManager = userRepository.findById(areaRequest.managerUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (newManager.getRole() != UserRole.AREA_ADMIN) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 기존 관리자 관계 삭제
        List<AreaManager> existingManagers = areaManagerRepository.findByAreaUuid(areaUuid);
        areaManagerRepository.deleteAll(existingManagers);

        // 새로운 관리자 관계 생성
        AreaManager newAreaManager = AreaManager.builder()
            .area(area)
            .user(newManager)
            .build();

        areaManagerRepository.save(newAreaManager);
    }

    @Override
    @Transactional
    public void deleteArea(UUID areaUuid) {
        // 권한 확인
        validateAreaAccess(areaUuid);

        Area area = areaRepository.findById(areaUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // 연관된 AreaManager 레코드들 삭제
        List<AreaManager> areaManagers = areaManagerRepository.findByAreaUuid(areaUuid);
        areaManagerRepository.deleteAll(areaManagers);

        // Area 엔티티 삭제
        areaRepository.delete(area);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaCountResponse getMyAreaCount() {
        // 현재 사용자 정보 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        UserRole currentUserRole = SecurityUtil.getCurrentUserRole()
            .orElseThrow(() -> new BusinessException(ErrorCode.PERMISSION_DENIED));

        Long count;
        if (currentUserRole == UserRole.ADMIN) {
            // ADMIN은 모든 구역 개수 반환
            count = areaRepository.count();
        } else if (currentUserRole == UserRole.AREA_ADMIN) {
            // AREA_ADMIN은 자신이 관리하는 구역 개수만 반환
            count = areaManagerRepository.countByUserUuid(currentUserUuid);
        } else {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }

        return AreaCountResponse.of(count);
    }
}
