package watch.out.accident.service;

import java.time.LocalDateTime;
import java.util.UUID;
import watch.out.accident.dto.request.AccidentReportRequest;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.dto.response.AccidentReportResponse;
import watch.out.accident.entity.AccidentType;
import watch.out.common.dto.PageRequest;
import watch.out.common.dto.PageResponse;

public interface AccidentService {

    AccidentResponse getAccident(UUID accidentUuid);

    /**
     * 페이지네이션을 지원하는 사고 목록 조회 (관리자 권한 체크 포함)
     *
     * @param pageRequest  페이지 요청 정보
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 페이지네이션된 사고 목록 (관리자가 관리하는 구역의 사고만)
     */
    PageResponse<AccidentsResponse> getAccidents(PageRequest pageRequest, UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 관리자가 관리하는 구역의 사고 목록만 조회
     *
     * @param pageRequest  페이지 요청 정보
     * @param areaUuid     구역 UUID (선택사항)
     * @param accidentType 사고 유형 (선택사항)
     * @param userUuid     사용자 UUID (선택사항)
     * @param startDate    시작 날짜 (선택사항)
     * @param endDate      종료 날짜 (선택사항)
     * @return 관리자가 관리하는 구역의 사고 목록
     */
    PageResponse<AccidentsResponse> getAccidentListForManager(PageRequest pageRequest,
        UUID areaUuid,
        AccidentType accidentType, UUID userUuid, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 사고 신고
     *
     * @param request 사고 신고 요청
     * @return 사고 신고 응답
     */
    AccidentReportResponse reportAccident(AccidentReportRequest request);
}
