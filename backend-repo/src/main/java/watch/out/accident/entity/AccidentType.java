package watch.out.accident.entity;

public enum AccidentType {
    AUTO_SOS("자동 SOS"),
    MANUAL_SOS("수동 SOS");

    private final String description;

    AccidentType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
