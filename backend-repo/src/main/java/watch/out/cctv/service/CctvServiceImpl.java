package watch.out.cctv.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.cctv.dto.response.CctvResponse;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;
import watch.out.cctv.dto.request.CreateCctvRequest;
import watch.out.cctv.dto.request.UpdateCctvRequest;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.repository.CctvRepository;

import java.util.List;
import java.util.UUID;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CctvServiceImpl implements CctvService {

	private final CctvRepository cctvRepository;
	private final AreaRepository areaRepository;

	@Override
	@Transactional
	public void createCctv(CreateCctvRequest createCctvRequest) {
		Area area = null;
		if (createCctvRequest.areaUuid() != null) {
			area = areaRepository.findById(createCctvRequest.areaUuid())
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
		}
		cctvRepository.save(createCctvRequest.toEntity(area));
	}

	@Override
	public PageResponse<CctvResponse> getCctv(PageRequest pageRequest, UUID areaUuid,
		Boolean isOnline, String cctvName) {
		List<CctvResponse> cctvResponseList = cctvRepository.findCctvsAsDto(areaUuid, isOnline,
			cctvName, pageRequest);
		long total = cctvRepository.countCctv(areaUuid, isOnline, cctvName);
		return PageResponse.of(cctvResponseList, pageRequest.pageNum(), pageRequest.display(),
			total);
	}

	@Override
	@Transactional
	public void deleteCctv(UUID cctvUuid) {
		if (!cctvRepository.existsById(cctvUuid)) {
			throw new BusinessException(ErrorCode.NOT_FOUND);
		}
		cctvRepository.deleteById(cctvUuid);
	}

	@Override
	@Transactional
	public CctvResponse updateCctv(UUID cctvUuid, UpdateCctvRequest updateCctvRequest) {
		Cctv cctv = cctvRepository.findById(cctvUuid)
			.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
		Area area = null;
		if (updateCctvRequest.areaUuid() != null) {
			area = areaRepository.findById(updateCctvRequest.areaUuid())
				.orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
		}

		cctv.update(updateCctvRequest.cctvName(), updateCctvRequest.cctvUrl(),
			updateCctvRequest.type(), area, updateCctvRequest.isOnline());
		return CctvResponse.fromEntity(cctv);
	}
}
