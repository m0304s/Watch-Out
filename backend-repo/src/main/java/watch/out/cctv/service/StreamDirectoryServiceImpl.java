package watch.out.cctv.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import watch.out.cctv.dto.response.AreaViewListResponse;
import watch.out.cctv.entity.Cctv;
import watch.out.cctv.entity.Type;
import watch.out.cctv.repository.CctvRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreamDirectoryServiceImpl implements StreamDirectoryService {

    private final CctvRepository cctvRepository;

    @Override
    public Optional<Cctv> findOne(UUID uuid) {
        return cctvRepository.findByUuidAndType(uuid, Type.CCTV); // ✅ enum
    }

    @Override
    public List<AreaViewListResponse.Item> listAreaProxyItems(UUID areaUuid,
        boolean useFastapiMjpeg) {
        return cctvRepository.findByAreaUuidAndType(areaUuid, Type.CCTV) // ✅ enum
            .stream()
            .map(cctv -> new AreaViewListResponse.Item(
                cctv.getUuid(),
                cctv.getCctvName(),
                springMjpegProxyUrl(cctv, useFastapiMjpeg),
                fastapiMjpegUrl(cctv),
                cctv.isOnline()
            ))
            .toList();
    }
}
