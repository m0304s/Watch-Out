package watch.out.dashboard.service;

import java.util.List;
import java.util.UUID;
import watch.out.dashboard.dto.request.AccidentStatusRequest;
import watch.out.dashboard.dto.response.AccidentStatusResponse;

/**
 * 사고 발생 현황 조회 서비스
 */
public interface AccidentStatusService {

    /**
     * 사고 발생 현황을 조회
     *
     * @param request 사고 발생 현황 조회 요청
     * @return 사고 발생 현황 응답
     */
    AccidentStatusResponse getAccidentStatus(AccidentStatusRequest request);
}
