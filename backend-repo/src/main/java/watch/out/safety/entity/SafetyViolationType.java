package watch.out.safety.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SafetyViolationType {
    // 단일 위반
    BELT_ON("안전밸트 착용"),
    BELT_OFF("안전밸트 미착용"),
    HOOK_ON("안전고리 결착"),
    HOOK_OFF("안전고리 미결착"),
    SHOES_ON("안전화 착용"),
    SHOES_OFF("안전화 미착용"),
    HELMET_ON("안전모 착용"),
    HELMET_OFF("안전모 미착용"),

    // 복합 위반 (2개 조합) - 알파벳 순서로 정렬
    BELT_OFF_HELMET_OFF("안전밸트 미착용 + 안전모 미착용"),
    BELT_OFF_HOOK_OFF("안전밸트 미착용 + 안전고리 미결착"),
    BELT_OFF_SHOES_OFF("안전밸트 미착용 + 안전화 미착용"),
    HELMET_OFF_HOOK_OFF("안전모 미착용 + 안전고리 미결착"),
    HELMET_OFF_SHOES_OFF("안전모 미착용 + 안전화 미착용"),
    HOOK_OFF_SHOES_OFF("안전고리 미결착 + 안전화 미착용"),

    // 복합 위반 (3개 조합) - 알파벳 순서로 정렬
    BELT_OFF_HELMET_OFF_HOOK_OFF("안전밸트 미착용 + 안전모 미착용 + 안전고리 미결착"),
    BELT_OFF_HELMET_OFF_SHOES_OFF("안전밸트 미착용 + 안전모 미착용 + 안전화 미착용"),
    BELT_OFF_HOOK_OFF_SHOES_OFF("안전밸트 미착용 + 안전고리 미결착 + 안전화 미착용"),
    HELMET_OFF_HOOK_OFF_SHOES_OFF("안전모 미착용 + 안전고리 미결착 + 안전화 미착용"),

    // 복합 위반 (4개 조합) - 알파벳 순서로 정렬
    BELT_OFF_HELMET_OFF_HOOK_OFF_SHOES_OFF("안전밸트 미착용 + 안전모 미착용 + 안전고리 미결착 + 안전화 미착용");

    private final String description;
}

