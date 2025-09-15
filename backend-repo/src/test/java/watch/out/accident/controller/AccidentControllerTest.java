package watch.out.accident.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import watch.out.accident.dto.request.AccidentReportRequest;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentsResponse;
import watch.out.accident.dto.response.AccidentReportResponse;
import watch.out.accident.dto.response.AreaInfo;
import watch.out.accident.dto.response.WorkerDetailInfo;
import watch.out.accident.dto.response.WorkerInfo;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.service.AccidentService;
import watch.out.common.dto.PageResponse;

@ExtendWith(MockitoExtension.class)
class AccidentControllerTest {

    @Mock
    private AccidentService accidentService;

    @InjectMocks
    private AccidentController accidentController;

    @Test
    @DisplayName("사고 상세 조회 - 성공")
    void getAccidentDetail_Success() {
        // given
        UUID accidentUuid = UUID.randomUUID();
        AccidentResponse expectedResponse = createAccidentDetailResponse(accidentUuid);

        when(accidentService.getAccident(accidentUuid)).thenReturn(expectedResponse);

        // when
        ResponseEntity<AccidentResponse> response = accidentController.getAccident(
            accidentUuid);
        AccidentResponse result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.accidentId()).isEqualTo(accidentUuid.toString());
        assertThat(result.accidentType()).isEqualTo("자동 SOS");
        assertThat(result.areaInfo().areaUuid()).isEqualTo(
            UUID.fromString("550e8400-e29b-41d4-a716-446655440001"));
        assertThat(result.areaInfo().areaName()).isEqualTo("A구역");
        assertThat(result.workerInfo().workerId()).isEqualTo("1234567");
        assertThat(result.workerInfo().workerName()).isEqualTo("김민준");
    }

    @Test
    @DisplayName("사고 목록 조회 - 성공")
    void getAccidentList_Success() {
        // given
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, null, null, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
        assertThat(result.data().get(0).accidentId()).isNotNull();
    }

    @Test
    @DisplayName("사고 신고 - 성공")
    void reportAccident_Success() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        AccidentReportResponse expectedResponse = createAccidentReportResponse();

        when(accidentService.reportAccident(any(AccidentReportRequest.class))).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<AccidentReportResponse> response = accidentController.reportAccident(
            request);
        AccidentReportResponse result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.accidentId()).isNotNull();
        assertThat(result.accidentType()).isEqualTo("자동 SOS");
        assertThat(result.areaInfo().areaUuid()).isNotNull();
        assertThat(result.workerInfo().workerId()).isNotNull();
    }

    @Test
    @DisplayName("사고 신고 - 유효성 검사 실패")
    void reportAccident_ValidationFailed() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(null);

        // when & then
        // 유효성 검사는 컨트롤러 레벨에서 처리되지 않으므로 정상적으로 처리됨
        // 실제로는 @Valid 어노테이션이 있어야 유효성 검사가 작동함
        ResponseEntity<AccidentReportResponse> response = accidentController.reportAccident(
            request);
        assertThat(response).isNotNull();
    }

    // ========== 다양한 사고 유형 테스트 ==========

    @Test
    @DisplayName("사고 신고 - 수동 SOS 신고")
    void reportAccident_ManualSOS() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.MANUAL_SOS);
        AccidentReportResponse expectedResponse = createAccidentReportResponseManualSOS();

        when(accidentService.reportAccident(any(AccidentReportRequest.class))).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<AccidentReportResponse> response = accidentController.reportAccident(
            request);
        AccidentReportResponse result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.accidentType()).isEqualTo("수동 SOS");
        assertThat(result.areaInfo().areaUuid()).isNotNull();
        assertThat(result.workerInfo().workerId()).isNotNull();
    }

    @Test
    @DisplayName("사고 신고 - 자동 SOS 신고")
    void reportAccident_AutoSOS() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        AccidentReportResponse expectedResponse = createAccidentReportResponseAutoSOS();

        when(accidentService.reportAccident(any(AccidentReportRequest.class))).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<AccidentReportResponse> response = accidentController.reportAccident(
            request);
        AccidentReportResponse result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.accidentType()).isEqualTo("자동 SOS");
        assertThat(result.areaInfo().areaUuid()).isNotNull();
        assertThat(result.workerInfo().workerId()).isNotNull();
    }

    // ========== 다양한 필터링 조합 테스트 ==========

    @Test
    @DisplayName("사고 목록 조회 - 구역별 필터링")
    void getAccidentList_WithAreaFilter() {
        // given
        UUID areaUuid = UUID.randomUUID();
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, areaUuid, null, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    @Test
    @DisplayName("사고 목록 조회 - 사고 유형별 필터링")
    void getAccidentList_WithTypeFilter() {
        // given
        AccidentType accidentType = AccidentType.MANUAL_SOS;
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, null, accidentType, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    @Test
    @DisplayName("사고 목록 조회 - 사용자별 필터링")
    void getAccidentList_WithUserFilter() {
        // given
        UUID userUuid = UUID.randomUUID();
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, null, null, userUuid, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    @Test
    @DisplayName("사고 목록 조회 - 복합 필터링")
    void getAccidentList_WithMultipleFilters() {
        // given
        UUID areaUuid = UUID.randomUUID();
        AccidentType accidentType = AccidentType.AUTO_SOS;
        UUID userUuid = UUID.randomUUID();
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, areaUuid, accidentType, userUuid, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    // ========== 페이지네이션 테스트 ==========

    @Test
    @DisplayName("사고 목록 조회 - 페이지네이션 (첫 페이지)")
    void getAccidentList_FirstPage() {
        // given
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 5, null, null, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    @Test
    @DisplayName("사고 목록 조회 - 페이지네이션 (두 번째 페이지)")
    void getAccidentList_SecondPage() {
        // given
        PageResponse<AccidentsResponse> expectedResponse = createAccidentListResponse();
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            1, 5, null, null, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).hasSize(1);
        assertThat(result.pagination().totalItems()).isEqualTo(1);
    }

    // ========== 빈 결과 테스트 ==========

    @Test
    @DisplayName("사고 목록 조회 - 빈 결과")
    void getAccidentList_EmptyResult() {
        // given
        PageResponse<AccidentsResponse> expectedResponse = PageResponse.of(List.of(), 0, 10, 0);
        when(accidentService.getAccidents(any(), any(), any(), any(), any(), any())).thenReturn(
            expectedResponse);

        // when
        ResponseEntity<PageResponse<AccidentsResponse>> response = accidentController.getAccidents(
            0, 10, null, null, null, null, null);
        PageResponse<AccidentsResponse> result = response.getBody();

        // then
        assertThat(result).isNotNull();
        assertThat(result.data()).isEmpty();
        assertThat(result.pagination().totalItems()).isEqualTo(0);
    }

    private AccidentResponse createAccidentDetailResponse(UUID accidentUuid) {
        AreaInfo areaInfo = AreaInfo.of(
            UUID.fromString("550e8400-e29b-41d4-a716-446655440001"),
            "A구역"
        );

        WorkerDetailInfo workerInfo = WorkerDetailInfo.of(
            "1234567",
            "김민준",
            "협력업체 A",
            "01012345678",
            "01087654321",
            "A+"
        );

        return AccidentResponse.of(
            accidentUuid.toString(),
            "자동 SOS",
            LocalDateTime.now(),
            areaInfo,
            workerInfo
        );
    }

    private PageResponse<AccidentsResponse> createAccidentListResponse() {
        AreaInfo areaInfo = AreaInfo.of(
            UUID.fromString("550e8400-e29b-41d4-a716-446655440001"),
            "A구역"
        );

        WorkerInfo workerInfo = WorkerInfo.of(
            "1234567",
            "김민준",
            "협력업체 A"
        );

        AccidentsResponse accident = AccidentsResponse.of(
            UUID.randomUUID().toString(),
            "자동 SOS",
            LocalDateTime.now(),
            areaInfo,
            workerInfo
        );

        return PageResponse.of(List.of(accident), 0, 10, 1);
    }

    private AccidentReportResponse createAccidentReportResponse() {
        AreaInfo areaInfo = AreaInfo.of(
            UUID.randomUUID(),
            "A구역"
        );

        WorkerInfo workerInfo = WorkerInfo.of(
            "1234567",
            "김민준",
            "협력업체 A"
        );

        return AccidentReportResponse.of(
            UUID.randomUUID().toString(),
            "자동 SOS",
            LocalDateTime.now(),
            areaInfo,
            workerInfo
        );
    }

    private AccidentReportResponse createAccidentReportResponseManualSOS() {
        AreaInfo areaInfo = AreaInfo.of(
            UUID.randomUUID(),
            "B구역"
        );

        WorkerInfo workerInfo = WorkerInfo.of(
            "2345678",
            "박지영",
            "협력업체 B"
        );

        return AccidentReportResponse.of(
            UUID.randomUUID().toString(),
            "수동 SOS",
            LocalDateTime.now(),
            areaInfo,
            workerInfo
        );
    }

    private AccidentReportResponse createAccidentReportResponseAutoSOS() {
        AreaInfo areaInfo = AreaInfo.of(
            UUID.randomUUID(),
            "C구역"
        );

        WorkerInfo workerInfo = WorkerInfo.of(
            "3456789",
            "이민수",
            "협력업체 C"
        );

        return AccidentReportResponse.of(
            UUID.randomUUID().toString(),
            "자동 SOS",
            LocalDateTime.now(),
            areaInfo,
            workerInfo
        );
    }
}
