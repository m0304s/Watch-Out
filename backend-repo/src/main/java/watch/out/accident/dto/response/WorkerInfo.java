package watch.out.accident.dto.response;

/**
 * 작업자 정보 DTO
 */
public record WorkerInfo(
    String workerId,
    String workerName,
    String companyName
) {

    /**
     * 작업자 정보 생성
     */
    public static WorkerInfo of(String workerId, String workerName, String companyName) {
        return new WorkerInfo(workerId, workerName, companyName);
    }
}
