package watch.out.watch.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.user.entity.User;
import watch.out.user.repository.UserRepository;
import watch.out.watch.dto.request.CreateWatchRequest;
import watch.out.watch.dto.request.RentWatchRequest;
import watch.out.watch.dto.request.UpdateWatchRequest;
import watch.out.watch.dto.response.RentalHistoryResponse;
import watch.out.watch.dto.response.WatchDetailResponse;
import watch.out.watch.dto.response.WatchListResponse;
import watch.out.watch.entity.RentalHistory;
import watch.out.watch.entity.Watch;
import watch.out.watch.entity.WatchStatus;
import watch.out.watch.repository.RentalHistoryRepository;
import watch.out.watch.repository.WatchRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchServiceImpl implements WatchService {

    private final WatchRepository watchRepository;
    private final UserRepository userRepository;
    private final RentalHistoryRepository rentalHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WatchListResponse> getWatches(PageRequest pageRequest) {
        return watchRepository.findWatches(pageRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public WatchDetailResponse getWatch(UUID watchUuid, PageRequest pageRequest) {
        Watch watch = watchRepository.findById(watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        PageResponse<RentalHistoryResponse> historyPage = watchRepository.findRentalHistoriesByWatchUuid(
            watchUuid, pageRequest);

        return WatchDetailResponse.from(watch, historyPage);
    }

    @Override
    @Transactional
    public void createWatch(CreateWatchRequest createWatchRequest) {
        Watch watch = createWatchRequest.toEntity();
        watchRepository.save(watch);
    }

    @Override
    @Transactional
    public void deleteWatch(UUID watchUuid) {
        Watch watch = watchRepository.findById(watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (watch.getStatus() == WatchStatus.IN_USE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        watchRepository.delete(watch);
    }

    @Override
    @Transactional
    public void updateWatch(UUID watchUuid, UpdateWatchRequest updateWatchRequest) {
        Watch watch = watchRepository.findById(watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        watch.update(updateWatchRequest.modelName(), updateWatchRequest.status(),
            updateWatchRequest.note());
    }

    @Override
    @Transactional
    public void rentWatch(UUID watchUuid, RentWatchRequest rentWatchRequest) {
        Watch watch = watchRepository.findById(watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        User user = userRepository.findById(rentWatchRequest.userUuid())
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (watch.getStatus() != WatchStatus.AVAILABLE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        // 워치 상태 변경
        watch.updateStatus(WatchStatus.IN_USE);

        // 대여 기록 생성
        RentalHistory rentalHistory = RentalHistory.builder()
            .watch(watch)
            .user(user)
            .build();
        rentalHistoryRepository.save(rentalHistory);
    }

    @Override
    @Transactional
    public void returnWatch(UUID watchUuid) {
        Watch watch = watchRepository.findById(watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (watch.getStatus() != WatchStatus.IN_USE) {
            throw new BusinessException(ErrorCode.BAD_REQUEST);
        }

        // 가장 최근의 대여 기록을 찾아 반납 처리
        RentalHistory rentalHistory = rentalHistoryRepository.findFirstByWatchUuidAndReturnedAtIsNullOrderByCreatedAtDesc(
                watchUuid)
            .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        rentalHistory.returnWatch();
        watch.updateStatus(WatchStatus.AVAILABLE);
    }
}
