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
  type VehicleSlotMap,
} from "./equipmentSlots";
import { availableFrames } from "../../../../libs/pilotVehicleData";

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
  accuracy: {
    attr1: string;
    attr2: string;
    value: number;
    defense: "def" | "mdef";
  };
  damage: { value: number; type: string; hrZero: boolean };
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

function getIndexedModules(
  player: TypePlayer,
): { mods: IndexedModule[]; s: VehicleSlotMap } | null {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return null;
  const s: VehicleSlotMap = vehicle.slots ?? {
    main: null,
    off: null,
    armor: null,
    support: [],
  };
  const mods = vehicle.modules.map((m, originalIndex) => ({
    ...m,
    originalIndex,
  })) as IndexedModule[];
  return { mods, s };
}

/**
 * All modules installed on the active vehicle that are equipped in `slot`,
 * with their original array index attached.
 */
export function getEquippedModulesForSlot(
  player: TypePlayer,
  slot: string,
): IndexedModule[] {
  const result = getIndexedModules(player);
  if (!result) return [];
  const { mods, s } = result;
  return mods.filter((m) => {
    const key = m.key ?? m.name;
    if (slot === "armor") return s.armor === key;
    if (slot === "mainHand") return s.main === key || s.off === key;
    if (slot === "offHand") return s.main === key || s.off === key;
    return false;
  });
}

/**
 * The single active module for `slot` derived from vehicle.slots, or null.
 */
export function getEquippedModuleForSlot(
  player: TypePlayer,
  slot: string,
): IndexedModule | null {
  const result = getIndexedModules(player);
  if (!result) return null;
  const { mods, s } = result;

  if (slot === "armor") return mods.find((m) => (m.key ?? m.name) === s.armor) ?? null;
  if (slot === "mainHand") return mods.find((m) => (m.key ?? m.name) === s.main) ?? null;
  if (slot === "offHand") return mods.find((m) => (m.key ?? m.name) === s.off) ?? null;
  return null;
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
      if (isTwoHandedEquipped(player)) return true;
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

  const s: VehicleSlotMap = vehicle.slots ?? {
    main: null,
    off: null,
    armor: null,
    support: [],
  };
  const counts: Record<string, number> = { weapon: 0, armor: 0, support: 0 };

  // Count weapons from slots.main/off (deduplicated for "both" case)
  const weaponKeys = new Set<string>(
    [s.main, s.off].filter((k): k is string => Boolean(k)),
  );
  for (const key of weaponKeys) {
    const mod = vehicle.modules.find((m) => (m.key ?? m.name) === key);
    if (mod) counts.weapon++;
  }

  if (s.armor) counts.armor = 1;

  for (const key of s.support) {
    const mod = vehicle.modules.find((m) => (m.key ?? m.name) === key);
    if (mod) counts.support += mod.isComplex ? 2 : 1;
  }

  return {
    counts,
    limits: (frame as Record<string, unknown>).limits as Record<string, number>,
  };
}

// Support modules

/**
 * All support modules that are in vehicle.slots.support on the active vehicle,
 * with their original array index for update purposes.
 */
export function getEquippedSupportModules(player: TypePlayer): IndexedModule[] {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return [];
  const s: VehicleSlotMap = vehicle.slots ?? {
    main: null,
    off: null,
    armor: null,
    support: [],
  };
  const supportKeys = new Set<string>(s.support);
  return vehicle.modules
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter(
      (m) =>
        supportKeys.has(m.key ?? m.name) && m.type === "pilot_module_support",
    ) as IndexedModule[];
}

export function getAvailableSupportModules(
  player: TypePlayer,
): IndexedModule[] {
  const pilotInfo = getPilotSpellInfo(player);
  if (!pilotInfo) return [];
  const spell = pilotInfo.spell;
  const vehicles = Array.isArray(spell.vehicles)
    ? spell.vehicles
    : Array.isArray(spell.currentVehicles)
      ? spell.currentVehicles
      : [];
  if (vehicles.length === 0) return [];
  const vehicle =
    vehicles.find((entry) => entry && entry.enabled) ?? vehicles[0];
  if (!vehicle || !Array.isArray(vehicle.modules)) return [];
  return vehicle.modules
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter((m) => {
      const module = m as Record<string, unknown>;
      return (
        module.type === "pilot_module_support" ||
        module.pilotSubtype === "support"
      );
    }) as IndexedModule[];
}

/**
 * List of enabled support modules for display in compact loadout.
 *
 * Uses active vehicle module state as source of truth so UI always reflects
 * toggles immediately, even when legacy slot maps are out of sync.
 */
export function getSupportSlots(player: TypePlayer): SupportSlotEntry[] {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return [];

  const vehicleName = vehicle.customName ?? "";
  return (vehicle.modules ?? [])
    .map((module) => ({
      module,
      key: module.key ?? module.name,
    }))
    .filter(
      ({ module }) =>
        module.type === "pilot_module_support" &&
        (module.enabled || module.equipped),
    )
    .map(({ module, key }) => ({
      ref: { vehicleName, moduleName: key },
      module,
    }));
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
    accuracy: { attr1: "might", attr2: "might", value: 0, defense: "def" },
    damage: {
      value: 5 + defensiveMasteryBonus,
      type: "physical",
      hrZero: false,
    },
    hands: 2,
    melee: true,
  };
}
