package watch.out.cctv.util;

import java.util.HashMap;
import java.util.Map;
import watch.out.cctv.entity.HeavyEquipmentType;

/**
 * AI 트리거 문자열을 HeavyEquipmentType enum으로 매핑하는 유틸리티 대소문자 구분 없이 매핑을 수행합니다.
 */
public class HeavyEquipmentMapper {

    private static final Map<String, HeavyEquipmentType> TRIGGER_MAPPING = new HashMap<>();

    static {
        // 기존 중장비 (소문자로 통일)
        TRIGGER_MAPPING.put("excavator", HeavyEquipmentType.EXCAVATOR);
        TRIGGER_MAPPING.put("crane", HeavyEquipmentType.CRANE);
        TRIGGER_MAPPING.put("bulldozer", HeavyEquipmentType.BULLDOZER);
        TRIGGER_MAPPING.put("loader", HeavyEquipmentType.LOADER);
        TRIGGER_MAPPING.put("dump truck", HeavyEquipmentType.DUMP_TRUCK);
        TRIGGER_MAPPING.put("forklift", HeavyEquipmentType.FORKLIFT);
        TRIGGER_MAPPING.put("concrete mixer", HeavyEquipmentType.CONCRETE_MIXER);
        TRIGGER_MAPPING.put("pile driver", HeavyEquipmentType.PILE_DRIVER);
        TRIGGER_MAPPING.put("grader", HeavyEquipmentType.GRADER);
        TRIGGER_MAPPING.put("backhoe", HeavyEquipmentType.BACKHOE);
        TRIGGER_MAPPING.put("skid steer", HeavyEquipmentType.SKID_STEER);
        TRIGGER_MAPPING.put("mobile crane", HeavyEquipmentType.MOBILE_CRANE);
        TRIGGER_MAPPING.put("truck crane", HeavyEquipmentType.TRUCK_CRANE);
        TRIGGER_MAPPING.put("wheel loader", HeavyEquipmentType.WHEEL_LOADER);
        TRIGGER_MAPPING.put("track loader", HeavyEquipmentType.TRACK_LOADER);
        TRIGGER_MAPPING.put("compactor", HeavyEquipmentType.COMPACTOR);
        TRIGGER_MAPPING.put("roller", HeavyEquipmentType.ROLLER);
        TRIGGER_MAPPING.put("paver", HeavyEquipmentType.PAVER);

        // 새로운 중장비 (소문자로 통일)
        TRIGGER_MAPPING.put("fork lane", HeavyEquipmentType.FORK_LANE);
        TRIGGER_MAPPING.put("payloader", HeavyEquipmentType.PAYLOADER);
        TRIGGER_MAPPING.put("remicon", HeavyEquipmentType.REMICON);
        TRIGGER_MAPPING.put("pump car", HeavyEquipmentType.PUMP_CAR);
        TRIGGER_MAPPING.put("truck", HeavyEquipmentType.TRUCK);
        TRIGGER_MAPPING.put("aerial workbench", HeavyEquipmentType.AERIAL_WORKBENCH);
        TRIGGER_MAPPING.put("tower crane", HeavyEquipmentType.TOWER_CRANE);
        TRIGGER_MAPPING.put("aerial work platform car",
            HeavyEquipmentType.AERIAL_WORK_PLATFORM_CAR);
        TRIGGER_MAPPING.put("gang form", HeavyEquipmentType.GANG_FORM);
        TRIGGER_MAPPING.put("al form", HeavyEquipmentType.AL_FORM);
        TRIGGER_MAPPING.put("a-type ladder", HeavyEquipmentType.A_TYPE_LADDER);
        TRIGGER_MAPPING.put("uma", HeavyEquipmentType.UMA);
        TRIGGER_MAPPING.put("elb", HeavyEquipmentType.ELB);
        TRIGGER_MAPPING.put("opening cover", HeavyEquipmentType.OPENING_COVER);
        TRIGGER_MAPPING.put("dangerous goods storage", HeavyEquipmentType.DANGEROUS_GOODS_STORAGE);
        TRIGGER_MAPPING.put("elevator fall arrester", HeavyEquipmentType.ELEVATOR_FALL_ARRESTER);
        TRIGGER_MAPPING.put("hoist", HeavyEquipmentType.HOIST);
        TRIGGER_MAPPING.put("jack support", HeavyEquipmentType.JACK_SUPPORT);
        TRIGGER_MAPPING.put("steal pipe scaffolding", HeavyEquipmentType.STEAL_PIPE_SCAFFOLDING);
        TRIGGER_MAPPING.put("system scaffolding", HeavyEquipmentType.SYSTEM_SCAFFOLDING);
        TRIGGER_MAPPING.put("cement brick", HeavyEquipmentType.CEMENT_BRICK);
        TRIGGER_MAPPING.put("hammer", HeavyEquipmentType.HAMMER);
        TRIGGER_MAPPING.put("electric drill", HeavyEquipmentType.ELECTRIC_DRILL);
        TRIGGER_MAPPING.put("remital", HeavyEquipmentType.REMITAL);
        TRIGGER_MAPPING.put("stucco block", HeavyEquipmentType.STUCCO_BLOCK);
        TRIGGER_MAPPING.put("mixer", HeavyEquipmentType.MIXER);
        TRIGGER_MAPPING.put("h beam", HeavyEquipmentType.H_BEAM);
        TRIGGER_MAPPING.put("high speed cutting machine",
            HeavyEquipmentType.HIGH_SPEED_CUTTING_MACHINE);
        TRIGGER_MAPPING.put("vibrator", HeavyEquipmentType.VIBRATOR);
        TRIGGER_MAPPING.put("fire extinguisher", HeavyEquipmentType.FIRE_EXTINGUISHER);
        TRIGGER_MAPPING.put("welding machine", HeavyEquipmentType.WELDING_MACHINE);
        TRIGGER_MAPPING.put("hand grinder", HeavyEquipmentType.HAND_GRINDER);
        TRIGGER_MAPPING.put("hand car", HeavyEquipmentType.HAND_CAR);
        TRIGGER_MAPPING.put("anti-burn", HeavyEquipmentType.ANTI_BURN);
    }

    /**
     * AI 트리거 문자열을 HeavyEquipmentType으로 변환 대소문자 구분 없이 매핑을 수행합니다.
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return HeavyEquipmentType enum, 매핑되지 않은 경우 null
     */
    public static HeavyEquipmentType mapTriggerToHeavyEquipmentType(String trigger) {
        if (trigger == null) {
            return null;
        }
        return TRIGGER_MAPPING.get(trigger.toLowerCase().trim());
    }

    /**
     * 중장비 관련 트리거인지 확인 대소문자 구분 없이 확인을 수행합니다.
     *
     * @param trigger AI에서 감지된 트리거 문자열
     * @return 중장비 관련 트리거인 경우 true
     */
    public static boolean isHeavyEquipmentTrigger(String trigger) {
        if (trigger == null) {
            return false;
        }
        return TRIGGER_MAPPING.containsKey(trigger.toLowerCase().trim());
    }
}
