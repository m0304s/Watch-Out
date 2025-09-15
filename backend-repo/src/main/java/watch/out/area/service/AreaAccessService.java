package watch.out.area.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import watch.out.area.entity.Area;
import watch.out.area.entity.AreaManager;
import watch.out.area.repository.AreaManagerRepository;
import watch.out.area.repository.AreaRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.user.entity.UserRole;

/**
 * 구역 접근 권한 검사 서비스
 */
@Service
@RequiredArgsConstructor
public class AreaAccessService {

    private final AreaRepository areaRepository;
    private final AreaManagerRepository areaManagerRepository;

    /**
     * 권한에 따른 구역 목록 조회
     *
     * @param areaUuids 요청된 구역 UUID 리스트 (null이거나 비어있으면 전체 구역)
     * @return 접근 가능한 구역 목록
     */
    public List<Area> getAccessibleAreas(List<UUID> areaUuids) {
        // 현재 사용자 정보 조회
        UUID currentUserUuid = SecurityUtil.getCurrentUserUuid()
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

        UserRole currentUserRole = SecurityUtil.getCurrentUserRole()
            .orElseThrow(() -> new BusinessException(ErrorCode.PERMISSION_DENIED));

        if (currentUserRole == UserRole.ADMIN) {
            return getAreasForAdmin(areaUuids);
        } else if (currentUserRole == UserRole.AREA_ADMIN) {
            return getAreasForAreaAdmin(currentUserUuid, areaUuids);
        } else {
            throw new BusinessException(ErrorCode.PERMISSION_DENIED);
        }
    }

    /**
     * ADMIN 권한으로 구역 조회
     */
    private List<Area> getAreasForAdmin(List<UUID> areaUuids) {
        if (areaUuids == null || areaUuids.isEmpty()) {
            return areaRepository.findAll();
        } else {
            return areaUuids.stream()
                .map(areaRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
        }
    }

    /**
     * AREA_ADMIN 권한으로 구역 조회
     */
    private List<Area> getAreasForAreaAdmin(UUID userUuid, List<UUID> areaUuids) {
        List<Area> managedAreas = getManagedAreas(userUuid);

        if (areaUuids == null || areaUuids.isEmpty()) {
            // 요청된 구역이 없으면 관리하는 모든 구역 반환
            return managedAreas;
        } else {
            // 요청된 구역 중에서 관리하는 구역만 필터링
            List<UUID> managedAreaUuids = managedAreas.stream()
                .map(Area::getUuid)
                .toList();

            List<UUID> validAreaUuids = areaUuids.stream()
                .filter(managedAreaUuids::contains)
                .toList();

            if (validAreaUuids.isEmpty()) {
                throw new BusinessException(ErrorCode.PERMISSION_DENIED);
            }

            return validAreaUuids.stream()
                .map(areaRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();
        }
    }

    /**
     * 사용자가 관리하는 구역 목록 조회
     */
    private List<Area> getManagedAreas(UUID userUuid) {
        List<AreaManager> areaManagers = areaManagerRepository.findByUserUuid(userUuid);
        return areaManagers.stream()
            .map(AreaManager::getArea)
            .toList();
    }

    /**
     * 구역 유효성 검사
     */
    public void validateAreas(List<UUID> requestedAreaUuids, List<Area> foundAreas) {
        // areaUuids가 null이거나 비어있으면 모든 구역 조회이므로 검사하지 않음
        if (requestedAreaUuids == null || requestedAreaUuids.isEmpty()) {
            return;
        }

        // 요청된 구역이 하나도 없으면 예외 발생
        if (foundAreas.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        // 요청된 구역 수와 조회된 구역 수가 다르면 일부 구역이 존재하지 않음
        if (foundAreas.size() != requestedAreaUuids.size()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
    }
}
