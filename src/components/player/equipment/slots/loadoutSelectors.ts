import {
  TypePlayer,
  PlayerClass,
  Spells,
  Skills,
  MnemosphereSkill,
  MnemosphereHeroic,
  MnemosphereSpell,
} from "../../../../types/Players";
import {
  resolveEffectiveSlot,
  getActiveVehicle,
  isTwoHandedEquipped,
  isItemEquipped,
  ResolvedVehicleModule,
} from "./equipmentSlots";
import { availableFrames } from "../../../../libs/pilotVehicleData";
import { getModuleTypeForLimits } from "../../spells/vehicleReducer";

// Types

export type PilotSpellInfo = {
  spell: Spells;
  classIndex: number;
  spellIndex: number;
};

export type IndexedModule = ResolvedVehicleModule & { originalIndex: number };

export type SupportSlotEntry = {
  ref: { vehicleName: string; moduleName: string };
  module: ResolvedVehicleModule | null;
};

export type AuxHandItem = {
  name: string;
  att1: string;
  att2: string;
  damage: number;
  prec: number;
  type: string;
  hands: number;
  melee: boolean;
};

// Pilot spell

/**
 * Find the pilot-vehicle spell and return its location in the class/spell tree.
 * Returns null if the player has no pilot-vehicle spell.
 */
export function getPilotSpellInfo(player: TypePlayer): PilotSpellInfo | null {
  for (const [ci, cls] of (player.classes ?? []).entries()) {
    for (const [si, spell] of (cls.spells ?? []).entries()) {
      if (spell.spellType === "pilot-vehicle") {
        return { spell, classIndex: ci, spellIndex: si };
      }
    }
  }
  return null;
}

// Vehicle module queries

/**
 * All modules installed on the active vehicle that are relevant for `slot`
 * (regardless of enabled/equipped state), with their original array index attached.
 */
export function getEquippedModulesForSlot(
  player: TypePlayer,
  slot: string,
): IndexedModule[] {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return [];
  return vehicle.modules
    .map((m, originalIndex) => ({ ...m, originalIndex }))
    .filter((m) => {
      if (slot === "armor") return m.type === "pilot_module_armor";
      if (slot === "mainHand" || slot === "offHand")
        return m.type === "pilot_module_weapon";
      return false;
    }) as IndexedModule[];
}

/**
 * The single active module for `slot` (the one whose equippedSlot matches),
 * or the first installed module for that slot type, or null.
 */
export function getEquippedModuleForSlot(
  player: TypePlayer,
  slot: string,
): IndexedModule | null {
  const mods = getEquippedModulesForSlot(player, slot);
  const activeMods = mods.filter((m) => m.enabled || m.equipped);
  return (
    activeMods.find((m) => {
      if (slot === "armor") return m.equippedSlot === "armor";
      if (slot === "mainHand")
        return (
          m.equippedSlot === "main" ||
          m.equippedSlot === "mainHand" ||
          m.equippedSlot === "both"
        );
      if (slot === "offHand")
        return (
          m.equippedSlot === "off" ||
          m.equippedSlot === "offHand" ||
          m.equippedSlot === "both"
        );
      return false;
    }) ??
    activeMods[0] ??
    null
  );
}

// Slot locks

/**
 * Derive which hand slots are locked for the current player + vehicle state.
 *
 * mainHandLocked: offHand has a vehicle module but no mainHand module exists.
 * offHandLocked:  mainHand has a cumbersome vehicle module, OR mainHand has a
 *                 vehicle module but no offHand module exists, OR mainHand holds
 *                 a two-handed player item.
 */
export function getSlotLocks(player: TypePlayer): {
  mainHandLocked: boolean;
  offHandLocked: boolean;
} {
  const mainHandResolved = resolveEffectiveSlot(player, "mainHand");
  const offHandResolved = resolveEffectiveSlot(player, "offHand");

  const mainHandLocked = !!(
    offHandResolved?.kind === "vehicleModule" &&
    !getEquippedModuleForSlot(player, "mainHand")
  );

  const offHandLocked = (() => {
    if (mainHandResolved?.kind === "vehicleModule") {
      if (mainHandResolved.module.cumbersome) return true;
      if (!getEquippedModuleForSlot(player, "offHand")) return true;
      return false;
    }
    return isTwoHandedEquipped(player);
  })();

  return { mainHandLocked, offHandLocked };
}

// Vehicle module usage counters

/**
 * Returns used/limit counts per module type for the active vehicle,
 * or null when no vehicle is active.
 */
export function getVehicleModuleUsage(
  player: TypePlayer,
): { counts: Record<string, number>; limits: Record<string, number> } | null {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return null;

  const frame =
    availableFrames.find(
      (f: Record<string, unknown>) =>
        f.name ===
        ("frame" in vehicle
          ? (vehicle as Record<string, unknown>).frame
          : undefined),
    ) ??
    ({ limits: { weapon: 2, armor: 1, support: -1 } } as Record<
      string,
      unknown
    >);

  const counts: Record<string, number> = { weapon: 0, armor: 0, support: 0 };
  for (const m of vehicle.modules) {
    if (!m.equipped) continue;
    const type = getModuleTypeForLimits(m);
    if (type === "custom") continue;
    counts[type] += type === "support" && m.isComplex ? 2 : 1;
  }
  return {
    counts,
    limits: (frame as Record<string, unknown>).limits as Record<string, number>,
  };
}

// Support modules

/**
 * All support modules that are installed (equipped) on the active vehicle,
 * with their original array index for update purposes.
 */
export function getEquippedSupportModules(player: TypePlayer): IndexedModule[] {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return [];
  return vehicle.modules
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter(
      (m) => m.equipped && m.type === "pilot_module_support",
    ) as IndexedModule[];
}

/**
 * Deduplicated list of active support slot entries for display (complex modules
 * occupy 2 slots but appear only once in this list).
 */
export function getSupportSlots(player: TypePlayer): SupportSlotEntry[] {
  const vs = player.vehicleSlots;
  const vehicle = getActiveVehicle(player);
  if (!vs?.support?.length) return [];

  const seen = new Set<string>();
  return (vs.support ?? [])
    .map((ref) => {
      if (!ref) return null;
      const key = `${ref.vehicleName}|${ref.moduleName}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const module =
        vehicle?.modules.find((m) => m.name === ref.moduleName && m.enabled) ??
        null;
      return { ref, module } as SupportSlotEntry;
    })
    .filter((e): e is SupportSlotEntry => e !== null);
}

// Technosphere benefit application

export interface ActiveMnemosphereData {
  skills: MnemosphereSkill[];
  heroic: MnemosphereHeroic[];
  spells: MnemosphereSpell[];
}

/**
 * Collects all mnemosphere skills/heroic/spells from currently equipped player items.
 * Only runs when technospheres optional rule is active.
 * Vehicle module slots are excluded (benefits only apply to player items).
 */
export function getActiveMnemosphereSkills(
  player: TypePlayer,
): ActiveMnemosphereData {
  const result: ActiveMnemosphereData = { skills: [], heroic: [], spells: [] };
  const isTechnospheres =
    player.settings?.optionalRules?.technospheres ?? false;
  if (!isTechnospheres) return result;

  const eq0 = player.equipment?.[0];
  if (!eq0) return result;

  for (const slotKey of [
    "mainHand",
    "offHand",
    "armor",
    "accessory",
  ] as const) {
    const resolved = resolveEffectiveSlot(player, slotKey);
    if (!resolved || resolved.kind !== "playerItem") continue;

    const ref = player.equippedSlots?.[slotKey];
    if (!ref) continue;
    const arr =
      (eq0[ref.source] as { name: string; slotted?: string[] }[] | undefined) ??
      [];
    const item =
      ref.index !== undefined
        ? arr[ref.index]
        : arr.find((i) => i.name === ref.name);
    if (!item || !("slotted" in item) || !item.slotted?.length) continue;

    for (const id of item.slotted) {
      const mnemo = (eq0.mnemospheres ?? []).find((m) => m.id === id);
      if (!mnemo) continue;
      result.skills.push(...(mnemo.skills ?? []));
      result.heroic.push(...(mnemo.heroic ?? []));
      result.spells.push(...(mnemo.spells ?? []));
    }
  }

  return result;
}

// Aux hand

/**
 * Synthesise the "Twin Shields" aux hand weapon when the Dual Shieldbearer skill
 * is active and 2 shields are equipped.  Returns null otherwise.
 */
export function getAuxHandItem(player: TypePlayer): AuxHandItem | null {
  const hasDualShieldBearer = (player.classes ?? []).some((cls: PlayerClass) =>
    (cls.skills ?? []).some(
      (sk: Skills) =>
        sk.specialSkill === "Dual Shieldbearer" && sk.currentLvl === 1,
    ),
  );
  if (!hasDualShieldBearer) return null;

  const inv = player.equipment?.[0];
  const equippedShieldsCount = (inv?.shields ?? []).filter((s) =>
    isItemEquipped(player, s),
  ).length;
  if (equippedShieldsCount < 2) return null;

  const defensiveMasteryBonus = (player.classes ?? [])
    .flatMap((cls: PlayerClass) => cls.skills ?? [])
    .filter((sk: Skills) => sk.specialSkill === "Defensive Mastery")
    .reduce((sum: number, sk: Skills) => sum + (sk.currentLvl ?? 0), 0);

  return {
    name: "Twin Shields",
    att1: "might",
    att2: "might",
    damage: 5 + defensiveMasteryBonus,
    prec: 0,
    type: "physical",
    hands: 2,
    melee: true,
  };
}
