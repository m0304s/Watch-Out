package watch.out.cctv.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 중장비 유형 ENUM
 */
@Getter
@RequiredArgsConstructor
public enum HeavyEquipmentType {
    EXCAVATOR("굴착기"),
    CRANE("크레인"),
    BULLDOZER("불도저"),
    LOADER("로더"),
    DUMP_TRUCK("덤프트럭"),
    FORKLIFT("지게차"),
    CONCRETE_MIXER("콘크리트 믹서"),
    PILE_DRIVER("파일드라이버"),
    GRADER("그레이더"),
    BACKHOE("백호"),
    SKID_STEER("스키드스티어"),
    MOBILE_CRANE("모바일크레인"),
    TRUCK_CRANE("트럭크레인"),
    WHEEL_LOADER("휠로더"),
    TRACK_LOADER("트랙로더"),
    COMPACTOR("컴팩터"),
    ROLLER("롤러"),
    PAVER("포장기"),
    FORK_LANE("포크레인"),
    PAYLOADER("페이로더"),
    REMICON("레미콘"),
    PUMP_CAR("펌프카"),
    TRUCK("트럭"),
    AERIAL_WORKBENCH("고소작업대"),
    TOWER_CRANE("타워크레인"),
    AERIAL_WORK_PLATFORM_CAR("고소작업대차"),
    GANG_FORM("갱폼"),
    AL_FORM("알폼"),
    A_TYPE_LADDER("A형사다리"),
    UMA("우마"),
    ELB("ELB"),
    OPENING_COVER("개구부 덮개"),
    DANGEROUS_GOODS_STORAGE("위험물 저장소"),
    ELEVATOR_FALL_ARRESTER("엘리베이터 낙하방지장치"),
    HOIST("호이스트"),
    JACK_SUPPORT("잭 서포트"),
    STEAL_PIPE_SCAFFOLDING("스틸파이프 비계"),
    SYSTEM_SCAFFOLDING("시스템 비계"),
    CEMENT_BRICK("시멘트 벽돌"),
    HAMMER("해머"),
    ELECTRIC_DRILL("전기드릴"),
    REMITAL("레미탈"),
    STUCCO_BLOCK("스터코 블록"),
    MIXER("믹서"),
    H_BEAM("H빔"),
    HIGH_SPEED_CUTTING_MACHINE("고속절단기"),
    VIBRATOR("바이브레이터"),
    FIRE_EXTINGUISHER("소화기"),
    WELDING_MACHINE("용접기"),
    HAND_GRINDER("핸드그라인더"),
    HAND_CAR("핸드카"),
    ANTI_BURN("방화재");

    private final String description;
}
