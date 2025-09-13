package watch.out.accident.dto.response;

/**
 * 작업자 상세 정보 DTO (사고 상세 조회용)
 */
public record WorkerDetailInfo(
    String workerId,
    String workerName,
    String companyName,
    String contact,
    String emergencyContact,
    String bloodType
) {

    /**
     * 작업자 상세 정보 생성
     */
    public static WorkerDetailInfo of(String workerId, String workerName, String companyName,
        String contact, String emergencyContact, String bloodType) {
        return new WorkerDetailInfo(workerId, workerName, companyName, contact, emergencyContact,
            bloodType);
    }
}
