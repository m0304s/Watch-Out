package watch.out.accident.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mockStatic;

import org.mockito.MockedStatic;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import watch.out.accident.dto.request.AccidentReportRequest;
import watch.out.accident.dto.response.AccidentResponse;
import watch.out.accident.dto.response.AccidentReportResponse;
import watch.out.accident.dto.response.AreaInfo;
import watch.out.accident.dto.response.UserWithAreaDto;
import watch.out.accident.dto.response.WorkerDetailInfo;
import watch.out.accident.entity.Accident;
import watch.out.accident.entity.AccidentType;
import watch.out.accident.repository.AccidentRepository;
import watch.out.accident.repository.AccidentRepositoryCustom;
import watch.out.area.entity.Area;
import watch.out.area.repository.AreaRepository;
import watch.out.common.exception.BusinessException;
import watch.out.common.exception.ErrorCode;
import watch.out.common.util.SecurityUtil;
import watch.out.user.entity.User;
import watch.out.user.entity.UserRole;
import watch.out.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AccidentServiceUnitTest {

    @Mock
    private AccidentRepository accidentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AreaRepository areaRepository;
    @Mock
    private AccidentRepositoryCustom accidentRepositoryCustom;

    @InjectMocks
    private AccidentServiceImpl accidentService;

    @Test
    @DisplayName("사고 상세 조회 - 성공")
    void getAccidentDetail_Success() {
        // given
        UUID accidentUuid = UUID.randomUUID();
        UUID currentUserUuid = UUID.randomUUID();
        AccidentResponse expectedResponse = createAccidentDetailResponse(accidentUuid);

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));
            mockedSecurityUtil.when(SecurityUtil::isAdmin).thenReturn(true);
            mockedSecurityUtil.when(SecurityUtil::isAreaAdmin).thenReturn(false);

            when(accidentRepository.findAccidentDetailById(accidentUuid))
                .thenReturn(Optional.of(expectedResponse));

            // when
            AccidentResponse result = accidentService.getAccident(accidentUuid);

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
    }

    @Test
    @DisplayName("사고 상세 조회 - 사고를 찾을 수 없음")
    void getAccidentDetail_NotFound() {
        // given
        UUID accidentUuid = UUID.randomUUID();

        when(accidentRepository.findAccidentDetailById(accidentUuid))
            .thenReturn(Optional.empty());

        // when & then
        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(UUID.randomUUID()));

            assertThatThrownBy(() -> accidentService.getAccident(accidentUuid))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_FOUND);
        }
    }

    @Test
    @DisplayName("사고 신고 - 성공")
    void reportAccident_Success() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        UUID currentUserUuid = UUID.randomUUID();
        UserWithAreaDto userWithArea = createUserWithAreaDto(currentUserUuid);
        User user = createUser();
        Area area = createArea();

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.of(userWithArea));
            when(userRepository.findById(currentUserUuid))
                .thenReturn(Optional.of(user));
            when(areaRepository.findById(userWithArea.areaUuid()))
                .thenReturn(Optional.of(area));
            when(accidentRepository.save(any(Accident.class)))
                .thenReturn(createAccident());

            // when
            AccidentReportResponse result = accidentService.reportAccident(request);

            // then
            assertThat(result).isNotNull();
            assertThat(result.accidentType()).isEqualTo("자동 SOS");
            assertThat(result.areaInfo().areaUuid()).isNotNull();
            assertThat(result.workerInfo().workerId()).isNotNull();
        }
    }

    @Test
    @DisplayName("사고 신고 - 배정된 구역이 없음")
    void reportAccident_NoAssignedArea() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        UUID currentUserUuid = UUID.randomUUID();
        UserWithAreaDto userWithArea = createUserWithAreaDtoWithoutArea(currentUserUuid);

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.of(userWithArea));

            // when & then
            assertThatThrownBy(() -> accidentService.reportAccident(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT);
        }
    }

    // ========== JWT 토큰 관련 테스트 ==========


    @Test
    @DisplayName("사고 신고 - JWT 토큰 없음")
    void reportAccident_NoToken() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid).thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> accidentService.reportAccident(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_TOKEN);
        }
    }

    // ========== 다양한 사고 유형 테스트 ==========

    @Test
    @DisplayName("사고 신고 - 수동 SOS 신고")
    void reportAccident_ManualSOS() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.MANUAL_SOS);
        UUID currentUserUuid = UUID.randomUUID();
        UserWithAreaDto userWithArea = createUserWithAreaDto(currentUserUuid);
        User user = createUser();
        Area area = createArea();

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.of(userWithArea));
            when(userRepository.findById(currentUserUuid))
                .thenReturn(Optional.of(user));
            when(areaRepository.findById(userWithArea.areaUuid()))
                .thenReturn(Optional.of(area));
            when(accidentRepository.save(any(Accident.class)))
                .thenReturn(createAccident(AccidentType.MANUAL_SOS));

            // when
            AccidentReportResponse result = accidentService.reportAccident(request);

            // then
            assertThat(result).isNotNull();
            assertThat(result.accidentType()).isEqualTo("수동 SOS");
            assertThat(result.areaInfo().areaUuid()).isNotNull();
            assertThat(result.workerInfo().workerId()).isNotNull();
        }
    }

    // ========== 존재하지 않는 리소스 접근 테스트 ==========

    @Test
    @DisplayName("사고 신고 - 사용자 정보를 찾을 수 없음")
    void reportAccident_UserNotFound() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        UUID currentUserUuid = UUID.randomUUID();

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> accidentService.reportAccident(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_FOUND);
        }
    }

    @Test
    @DisplayName("사고 신고 - 구역 정보를 찾을 수 없음")
    void reportAccident_AreaNotFound() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        UUID currentUserUuid = UUID.randomUUID();
        UserWithAreaDto userWithArea = createUserWithAreaDto(currentUserUuid);
        User user = createUser();

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.of(userWithArea));
            when(userRepository.findById(currentUserUuid))
                .thenReturn(Optional.of(user));
            when(areaRepository.findById(userWithArea.areaUuid()))
                .thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> accidentService.reportAccident(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_FOUND);
        }
    }

    @Test
    @DisplayName("사고 신고 - 사용자 엔티티를 찾을 수 없음")
    void reportAccident_UserEntityNotFound() {
        // given
        AccidentReportRequest request = new AccidentReportRequest(AccidentType.AUTO_SOS);
        UUID currentUserUuid = UUID.randomUUID();
        UserWithAreaDto userWithArea = createUserWithAreaDto(currentUserUuid);

        try (MockedStatic<SecurityUtil> mockedSecurityUtil = mockStatic(SecurityUtil.class)) {
            mockedSecurityUtil.when(SecurityUtil::getCurrentUserUuid)
                .thenReturn(Optional.of(currentUserUuid));

            when(userRepository.findUserWithAreaById(currentUserUuid))
                .thenReturn(Optional.of(userWithArea));
            when(userRepository.findById(currentUserUuid))
                .thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> accidentService.reportAccident(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_FOUND);
        }
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

    private UserWithAreaDto createUserWithAreaDto(UUID userUuid) {
        return new UserWithAreaDto(
            userUuid,
            "test123",
            "테스트 사용자",
            "01012345678",
            "01087654321",
            "A",
            "PLUS",
            "테스트 협력업체",
            UUID.randomUUID(),
            "테스트 구역",
            "테스트 별칭"
        );
    }

    private UserWithAreaDto createUserWithAreaDtoWithoutArea(UUID userUuid) {
        return new UserWithAreaDto(
            userUuid,
            "test456",
            "테스트 사용자2",
            "01012345678",
            "01087654321",
            "B",
            "MINUS",
            "테스트 협력업체",
            null,
            null,
            null
        );
    }

    private User createUser() {
        return User.builder()
            .userId("test123")
            .userName("테스트 사용자")
            .role(UserRole.WORKER)
            .build();
    }

    private Area createArea() {
        return Area.builder()
            .areaName("테스트 구역")
            .areaAlias("테스트 별칭")
            .build();
    }

    private Accident createAccident() {
        return Accident.builder()
            .type(AccidentType.AUTO_SOS)
            .build();
    }

    private Accident createAccident(AccidentType type) {
        return Accident.builder()
            .type(type)
            .build();
    }
}