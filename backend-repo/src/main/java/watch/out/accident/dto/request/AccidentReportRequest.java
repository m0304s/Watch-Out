package watch.out.accident.dto.request;

import jakarta.validation.constraints.NotNull;
import watch.out.accident.entity.AccidentType;

/**
 * 사고 신고 요청 DTO
 */
public record AccidentReportRequest(
    @NotNull(message = "사고 유형은 필수입니다")
    AccidentType accidentType
) {

}
