package watch.out.cctv.util;

import java.util.Map;
import watch.out.cctv.entity.HeavyEquipmentType;

/**
 * AI 트리거 문자열을 HeavyEquipmentType enum으로 매핑하는 유틸리티
 */
public class HeavyEquipmentMapper {

    private static final Map<String, HeavyEquipmentType> TRIGGER_MAPPING = Map.of(
        // 기존 중장비
        "Excavator", HeavyEquipmentType.EXCAVATOR,
        "Crane", HeavyEquipmentType.CRANE,
        "Bulldozer", HeavyEquipmentType.BULLDOZER,
        "Loader", HeavyEquipmentType.LOADER,
        "Dump Truck", HeavyEquipmentType.DUMP_TRUCK,
        "Forklift", HeavyEquipmentType.FORKLIFT,
        "Concrete Mixer", HeavyEquipmentType.CONCRETE_MIXER,
        "Pile Driver", HeavyEquipmentType.PILE_DRIVER,
        "Grader", HeavyEquipmentType.GRADER,
        "Backhoe", HeavyEquipmentType.BACKHOE,
        "Skid Steer", HeavyEquipmentType.SKID_STEER,
        "Mobile Crane", HeavyEquipmentType.MOBILE_CRANE,
        "Truck Crane", HeavyEquipmentType.TRUCK_CRANE,
        "Wheel Loader", HeavyEquipmentType.WHEEL_LOADER,
        "Track Loader", HeavyEquipmentType.TRACK_LOADER,
        "Compactor", HeavyEquipmentType.COMPACTOR,
        "Roller", HeavyEquipmentType.ROLLER,
        "Paver", HeavyEquipmentType.PAVER,

        // 새로운 중장비
        "Fork lane", HeavyEquipmentType.FORK_LANE,
        "Payloader", HeavyEquipmentType.PAYLOADER,
        "Dump truck", HeavyEquipmentType.DUMP_TRUCK,
        "Remicon", HeavyEquipmentType.REMICON,
        "Pump car", HeavyEquipmentType.PUMP_CAR,
        "Pile driver", HeavyEquipmentType.PILE_DRIVER,
        "Truck", HeavyEquipmentType.TRUCK,
        "Aerial workbench", HeavyEquipmentType.AERIAL_WORKBENCH,
        "Tower crane", HeavyEquipmentType.TOWER_CRANE,
        "Aerial work platform car", HeavyEquipmentType.AERIAL_WORK_PLATFORM_CAR,
        "Gang form", HeavyEquipmentType.GANG_FORM,
        "Al form", HeavyEquipmentType.AL_FORM,
        "A-type ladder", HeavyEquipmentType.A_TYPE_LADDER,
        "Uma", HeavyEquipmentType.UMA,
        "ELB", HeavyEquipmentType.ELB,
        "Opening cover", HeavyEquipmentType.OPENING_COVER,
        "Dangerous goods storage", HeavyEquipmentType.DANGEROUS_GOODS_STORAGE,
        "Elevator fall arrester", HeavyEquipmentType.ELEVATOR_FALL_ARRESTER,
        "Hoist", HeavyEquipmentType.HOIST,
        "Jack support", HeavyEquipmentType.JACK_SUPPORT,
        "Steal pipe scaffolding", HeavyEquipmentType.STEAL_PIPE_SCAFFOLDING,
        "System scaffolding", HeavyEquipmentType.SYSTEM_SCAFFOLDING,
        "Cement brick", HeavyEquipmentType.CEMENT_BRICK,
        "Hammer", HeavyEquipmentType.HAMMER,
        "Electric drill", HeavyEquipmentType.ELECTRIC_DRILL,
        "Remital", HeavyEquipmentType.REMITAL,
        "Stucco block", HeavyEquipmentType.STUCCO_BLOCK,
        "Mixer", HeavyEquipmentType.MIXER,
        "H beam", HeavyEquipmentType.H_BEAM,
        "High speed cutting machine", HeavyEquipmentType.HIGH_SPEED_CUTTING_MACHINE,
        "Vibrator", HeavyEquipmentType.VIBRATOR,
        "Fire extinguisher", HeavyEquipmentType.FIRE_EXTINGUISHER,
        "Welding machine", HeavyEquipmentType.WELDING_MACHINE,
        "Hand grinder", HeavyEquipmentType.HAND_GRINDER,
        "Hand car", HeavyEquipmentType.HAND_CAR,
        "Anti-burn", HeavyEquipmentType.ANTI_BURN
    );

    /**
     * AI 트리거 문자열을 HeavyEquipmentType으로 변환
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return HeavyEquipmentType enum, 매핑되지 않은 경우 null
     */
    public static HeavyEquipmentType mapTriggerToHeavyEquipmentType(String trigger) {
        return TRIGGER_MAPPING.get(trigger);
    }

    /**
     * 중장비 관련 트리거인지 확인
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 중장비 관련 트리거인 경우 true
     */
    public static boolean isHeavyEquipmentTrigger(String trigger) {
        return TRIGGER_MAPPING.containsKey(trigger);
    }
}
