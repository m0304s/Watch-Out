package watch.out.safety.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SafetyViolationType {
    BELT_ON("안전밸트 착용"),
    BELT_OFF("안전밸트 미착용"),
    HOOK_ON("안전고리 결착"),
    HOOK_OFF("안전고리 미결착"),
    SHOES_ON("안전화 착용"),
    SHOES_OFF("안전화 미착용"),
    HELMET_ON("안전모 착용"),
    HELMET_OFF("안전모 미착용");

    private final String description;
}

