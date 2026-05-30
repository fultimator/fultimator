import {
  TypePlayer,
  EquippedSlots,
  SlotRef,
  AnyEquipmentItem,
  type Mnemosphere,
  PlayerClass,
  Spells,
  VehicleModule,
  Vehicle,
  CustomWeaponCustomization,
  PlayerEquipment,
} from "../../../../types/Players";
import { resolveEffectiveSlot, syncSlots } from "./equipmentSlots";
import type { PilotSpellInfo } from "./loadoutSelectors";

// Technosphere conflict detection

function getMnemosphereSkillKeys(
  player: TypePlayer,
  excludeSlot: string,
): Set<string> {
  const keys = new Set<string>();
  const eq0 = player.equipment?.[0];
  if (!eq0) return keys;

  // From innate classes
  const innateClasses: string[] =
    player.settings?.optionalRules?.innateClasses ?? [];
  for (const cls of player.classes ?? []) {
    if (innateClasses.includes(cls.name)) {
      for (const skill of cls.skills ?? []) {
        if (skill.specialSkill) keys.add(skill.specialSkill);
      }
    }
  }

  // From mnemospheres in all OTHER equipped slots
  const slotKeys = (
    ["mainHand", "offHand", "armor", "accessory"] as const
  ).filter((s) => s !== excludeSlot);

  for (const slotKey of slotKeys) {
    const ref = player.equippedSlots?.[slotKey as keyof EquippedSlots];
    if (!ref) continue;
    const arr = (eq0[ref.source] as AnyEquipmentItem[] | undefined) ?? [];
    const item =
      ref.index !== undefined
        ? arr[ref.index]
        : arr.find((i) => i.name === ref.name);
    if (!item || !("slotted" in item)) continue;
    for (const id of item.slotted ?? []) {
      const mnemo = (eq0.mnemospheres ?? []).find(
        (m: Mnemosphere) => m.id === id,
      );
      if (!mnemo) continue;
      for (const skill of mnemo.skills ?? []) {
        if (skill.specialSkill) keys.add(skill.specialSkill);
      }
      for (const heroic of mnemo.heroic ?? []) {
        if (heroic.specialSkill) keys.add(heroic.specialSkill);
      }
    }
  }

  return keys;
}

function checkMnemosphereConflict(
  player: TypePlayer,
  slot: string,
  candidate: PickerCandidate,
): string[] {
  const isTechnospheres =
    player.settings?.optionalRules?.technospheres ?? false;
  if (!isTechnospheres) return [];

  if (!("slotted" in candidate.item) || !candidate.item.slotted?.length)
    return [];

  const eq0 = player.equipment?.[0];
  const existing = getMnemosphereSkillKeys(player, slot);
  const conflicts: string[] = [];

  for (const id of candidate.item.slotted) {
    const mnemo = (eq0?.mnemospheres ?? []).find(
      (m: Mnemosphere) => m.id === id,
    );
    if (!mnemo) continue;
    for (const skill of mnemo.skills ?? []) {
      if (skill.specialSkill && existing.has(skill.specialSkill)) {
        conflicts.push(skill.name);
      }
    }
    for (const heroic of mnemo.heroic ?? []) {
      if (heroic.specialSkill && existing.has(heroic.specialSkill)) {
        conflicts.push(heroic.name);
      }
    }
  }

  return conflicts;
}

export function getEquipConflicts(
  player: TypePlayer,
  slot: string,
  candidate: PickerCandidate,
): string[] {
  return checkMnemosphereConflict(player, slot, candidate);
}

// Types

/** Candidate item from the slot picker. Matches the shape SlotPickerDialog builds. */
export type PickerCandidate = {
  source: "weapons" | "customWeapons" | "armor" | "shields" | "accessories";
  /** Item display name (matches item.name). */
  label: string;
  index: number;
  item: AnyEquipmentItem;
};

// Internal helpers

function patchInv(
  player: TypePlayer,
  source: string,
  updater: (arr: AnyEquipmentItem[]) => AnyEquipmentItem[],
): TypePlayer {
  const eq0 = {
    ...(player.equipment?.[0] ?? {}),
    [source]: updater(
      ((
        player.equipment?.[0] as unknown as
          | Record<string, AnyEquipmentItem[]>
          | undefined
      )?.[source] ?? []) as AnyEquipmentItem[],
    ),
  } as unknown;
  const equipment = (
    player.equipment
      ? [eq0 as unknown as PlayerEquipment, ...player.equipment.slice(1)]
      : [eq0 as unknown as PlayerEquipment]
  ) as TypePlayer["equipment"];
  return { ...player, equipment };
}

function applyVehicleUpdater(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  updaterFn: (vehicle: Vehicle) => Vehicle,
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const classes = (player.classes ?? []).map((cls: PlayerClass, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: Spells, si: number) =>
            si !== spellIndex
              ? s
              : (() => {
                  const vehicles = Array.isArray(s.vehicles)
                    ? s.vehicles
                    : Array.isArray(s.currentVehicles)
                      ? s.currentVehicles
                      : [];
                  const activeIndex = vehicles.findIndex(
                    (v: Vehicle) => v.enabled,
                  );
                  const targetIndex =
                    activeIndex >= 0
                      ? activeIndex
                      : vehicles.length > 0
                        ? 0
                        : -1;
                  const updatedVehicles = vehicles.map(
                    (v: Vehicle, vi: number) =>
                      vi !== targetIndex ? v : updaterFn(v),
                  );
                  return {
                    ...s,
                    vehicles: updatedVehicles,
                    currentVehicles: updatedVehicles,
                  };
                })(),
          ),
        },
  );
  return syncSlots({ ...player, classes });
}

function applyModuleUpdater(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  updaterFn: (modules: VehicleModule[]) => VehicleModule[],
): TypePlayer {
  return applyVehicleUpdater(player, pilotInfo, (v) => ({
    ...v,
    modules: updaterFn(v.modules ?? []),
  }));
}

// Equip / Unequip

/**
 * Equip `candidate` into `slot`, unequipping whatever was there before.
 * If a two-handed weapon is assigned to mainHand, offHand is also cleared.
 * Ends with `syncSlots` so both equippedSlots and vehicleSlots are consistent.
 */
function unequipRef(
  player: TypePlayer,
  ref: SlotRef | null | undefined,
): TypePlayer {
  if (!ref) return player;
  return patchInv(player, ref.source, (arr) =>
    arr.map((it, idx) => {
      const match =
        ref.index !== undefined ? idx === ref.index : it.name === ref.name;
      return match ? { ...it, isEquipped: false } : it;
    }),
  );
}

function resolveUnarmedRef(
  player: TypePlayer,
  defaultRef: SlotRef | null | undefined,
): { source: "weapons" | "customWeapons"; index: number; ref: SlotRef } | null {
  const inv = player.equipment?.[0];
  if (defaultRef) {
    const source = defaultRef.source as "weapons" | "customWeapons";
    const arr = (inv?.[source] ?? []) as AnyEquipmentItem[];
    const index =
      defaultRef.index !== undefined
        ? defaultRef.index
        : arr.findIndex((w) => w.name === defaultRef.name);
    if (index === -1 || !arr[index]) return null;
    return { source, index, ref: { source, name: arr[index].name, index } };
  }
  const weapons = inv?.weapons ?? [];
  const index = weapons.findIndex((w) => w.name === "Unarmed Strike");
  if (index === -1) return null;
  return {
    source: "weapons",
    index,
    ref: { source: "weapons", name: "Unarmed Strike", index },
  };
}

export function equipItemToSlot(
  player: TypePlayer,
  slot: string,
  candidate: PickerCandidate,
): TypePlayer {
  const isCustom = candidate.source === "customWeapons";
  const isTwoHand =
    isCustom ||
    ("hands" in candidate.item && candidate.item.hands === 2) ||
    ("isTwoHand" in candidate.item && candidate.item.isTwoHand);
  const isHandSlot = slot === "mainHand" || slot === "offHand";
  const otherHand =
    slot === "mainHand" ? "offHand" : slot === "offHand" ? "mainHand" : null;

  let updated = player;

  updated = unequipRef(
    updated,
    updated.equippedSlots?.[slot as keyof EquippedSlots],
  );

  if (slot === "mainHand" && isTwoHand) {
    updated = unequipRef(updated, updated.equippedSlots?.offHand);
  }

  // Block equip if candidate's mnemospheres conflict with existing equipped spheres.
  // Use `updated` (post-unequip) so the displaced item's spheres don't falsely conflict.
  const conflicts = checkMnemosphereConflict(updated, slot, candidate);
  if (conflicts.length > 0) return player;

  updated = patchInv(updated, candidate.source, (arr) =>
    arr.map((it, idx) => {
      const match =
        candidate.index !== undefined
          ? idx === candidate.index
          : it.name === candidate.label;
      return match ? { ...it, isEquipped: true } : it;
    }),
  );

  updated = syncSlots(updated);

  const candidateRef: SlotRef = {
    source: candidate.source,
    name: candidate.label,
    index: candidate.index,
  };
  const otherHandRef = otherHand
    ? updated.equippedSlots?.[otherHand as keyof EquippedSlots]
    : null;
  const otherHandDisplaced =
    otherHandRef?.source === candidateRef.source &&
    otherHandRef?.index === candidateRef.index;

  updated = {
    ...updated,
    equippedSlots: {
      ...updated.equippedSlots,
      [slot]: candidateRef,
      ...(otherHandDisplaced && otherHand ? { [otherHand]: null } : {}),
      ...(slot === "mainHand" && isTwoHand ? { offHand: null } : {}),
    },
  };

  const settings = updated.settings ?? {};
  if (settings.autoEquipUnarmed && isHandSlot && !isTwoHand) {
    const unarmed = resolveUnarmedRef(
      updated,
      settings.defaultUnarmedStrikeRef,
    );
    if (unarmed) {
      const emptyHands = (["mainHand", "offHand"] as const).filter(
        (h) => !updated.equippedSlots?.[h],
      );
      if (emptyHands.length > 0) {
        updated = patchInv(updated, unarmed.source, (arr) =>
          arr.map((it, idx) =>
            idx === unarmed.index ? { ...it, isEquipped: true } : it,
          ),
        );
        const newSlots = { ...updated.equippedSlots };
        for (const hand of emptyHands) newSlots[hand] = unarmed.ref;
        updated = { ...updated, equippedSlots: newSlots };
      }
    }
  }

  return updated;
}

/**
 * Clear a slot and auto-equip Unarmed Strike if enabled.
 */
export function clearSlotAction(player: TypePlayer, slot: string): TypePlayer {
  const currentRef = player.equippedSlots?.[slot as keyof EquippedSlots];
  if (!currentRef) return player;

  let updated = unequipRef(player, currentRef);

  updated = syncSlots(updated);

  const settings = updated.settings ?? {};
  if (
    settings.autoEquipUnarmed &&
    (slot === "mainHand" || slot === "offHand")
  ) {
    const unarmed = resolveUnarmedRef(
      updated,
      settings.defaultUnarmedStrikeRef,
    );
    if (unarmed) {
      const emptyHands = (["mainHand", "offHand"] as const).filter(
        (h) => !updated.equippedSlots?.[h],
      );
      if (emptyHands.length > 0) {
        updated = patchInv(updated, unarmed.source, (arr) =>
          arr.map((it, idx) =>
            idx === unarmed.index ? { ...it, isEquipped: true } : it,
          ),
        );
        const newSlots = { ...updated.equippedSlots };
        for (const hand of emptyHands) newSlots[hand] = unarmed.ref;
        updated = { ...updated, equippedSlots: newSlots };
      }
    }
  }

  return updated;
}

// Vehicle module actions

/**
 * Enable and assign `modules[moduleIndex]` to `slot`, disabling any other
 * equipped module that occupies the same physical position.
 */
export function selectModuleForSlot(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  slot: string,
  moduleIndex: number,
): TypePlayer {
  return applyModuleUpdater(player, pilotInfo, (modules) => {
    const targetSlot =
      slot === "armor" ? "armor" : slot === "mainHand" ? "main" : "off";
    const targetModule = modules[moduleIndex];
    if (!targetModule) return modules;
    const selectingArmor = slot === "armor";
    const selectingWeapon = slot === "mainHand" || slot === "offHand";

    const normalizeWeaponSlot = (
      raw: string | null | undefined,
      module: VehicleModule,
    ): "main" | "off" | "both" => {
      if (raw === "both") return "both";
      if (raw === "main" || raw === "mainHand") return "main";
      if (raw === "off" || raw === "offHand") return "off";
      return module?.isShield ? "off" : "main";
    };

    const isWeaponActive = (m: VehicleModule): boolean =>
      m.type === "pilot_module_weapon" && (m.enabled || m.equipped);

    const occupies = (m: VehicleModule, hand: "main" | "off"): boolean => {
      const s = normalizeWeaponSlot(m.equippedSlot, m);
      return s === "both" || s === hand;
    };

    const otherActiveWeapons = modules.filter(
      (m: VehicleModule, idx: number) =>
        idx !== moduleIndex && isWeaponActive(m),
    );

    let resolvedWeaponSlot: "main" | "off" | "both" = targetSlot as
      | "main"
      | "off"
      | "both";
    if (selectingWeapon) {
      if (targetModule.cumbersome) {
        resolvedWeaponSlot = "both";
      } else if (targetModule.isShield) {
        const mainOccupied = otherActiveWeapons.some((m: VehicleModule) =>
          occupies(m, "main"),
        );
        const offOccupied = otherActiveWeapons.some((m: VehicleModule) =>
          occupies(m, "off"),
        );
        const offShieldExists = otherActiveWeapons.some(
          (m: VehicleModule) => m.isShield && occupies(m, "off"),
        );
        const requestedMain = targetSlot === "main";

        if (requestedMain) {
          // Main-hand shield is legal only when another shield occupies off-hand.
          if (!(offShieldExists && !mainOccupied)) return modules;
          resolvedWeaponSlot = "main";
        } else {
          if (!offOccupied) {
            resolvedWeaponSlot = "off";
          } else if (offShieldExists && !mainOccupied) {
            // Second shield can move to main hand.
            resolvedWeaponSlot = "main";
          } else {
            return modules;
          }
        }
      } else {
        resolvedWeaponSlot = targetSlot as "main" | "off";
      }
    }

    return modules.map((m: VehicleModule, idx: number) => {
      const isTarget = idx === moduleIndex;
      const isCorrectType =
        (selectingArmor && m.type === "pilot_module_armor") ||
        (selectingWeapon && m.type === "pilot_module_weapon");
      if (!isCorrectType) return m;
      if (isTarget) {
        return {
          ...m,
          enabled: true,
          equipped: true,
          equippedSlot: selectingWeapon ? resolvedWeaponSlot : targetSlot,
        };
      }

      if (selectingArmor) {
        // Only one armor override can be active at a time.
        return m.enabled ? { ...m, enabled: false } : m;
      }

      // Weapon slot collision rules.
      const takingMain =
        resolvedWeaponSlot === "main" || resolvedWeaponSlot === "both";
      const takingOff =
        resolvedWeaponSlot === "off" || resolvedWeaponSlot === "both";
      const wasInMain =
        m.equippedSlot === "main" ||
        m.equippedSlot === "mainHand" ||
        m.equippedSlot === "both";
      const wasInOff =
        m.equippedSlot === "off" ||
        m.equippedSlot === "offHand" ||
        m.equippedSlot === "both";
      if ((takingMain && wasInMain) || (takingOff && wasInOff)) {
        return { ...m, enabled: false };
      }
      return m;
    });
  });
}

/**
 * Disable the active vehicle module that is occupying `slot`.
 */
export function disableModuleForSlot(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  slot: string,
): TypePlayer {
  return applyVehicleUpdater(player, pilotInfo, (v) => {
    const modules = v.modules ?? [];
    const slots = {
      main: v.slots?.main ?? null,
      off: v.slots?.off ?? null,
      armor: v.slots?.armor ?? null,
      support: [...(v.slots?.support ?? [])],
    };

    const occupiesRequestedSlot = (m: VehicleModule) => {
      const s = m.equippedSlot;
      if (slot === "armor") {
        return (
          m.type === "pilot_module_armor" &&
          (s === "armor" || slots.armor === (m.key ?? m.name))
        );
      }
      if (slot === "mainHand") {
        return (
          m.type === "pilot_module_weapon" &&
          (s === "main" || s === "mainHand" || s === "both" || slots.main === (m.key ?? m.name))
        );
      }
      if (slot === "offHand") {
        return (
          m.type === "pilot_module_weapon" &&
          (s === "off" || s === "offHand" || s === "both" || slots.off === (m.key ?? m.name))
        );
      }
      return false;
    };

    const keysToClear = new Set<string>();
    const nextModules = modules.map((m: VehicleModule) => {
      if (!occupiesRequestedSlot(m)) return m;
      const key = m.key ?? m.name;
      if (key) keysToClear.add(key);
      return { ...m, enabled: false, equipped: false };
    });

    if (keysToClear.size > 0) {
      if (slots.main && keysToClear.has(slots.main)) slots.main = null;
      if (slots.off && keysToClear.has(slots.off)) slots.off = null;
      if (slots.armor && keysToClear.has(slots.armor)) slots.armor = null;
      slots.support = slots.support.filter((k: string) => !keysToClear.has(k));
    }

    return { ...v, modules: nextModules, slots };
  });
}

/**
 * Toggle `enabled` on a support module by its original array index.
 */
export function toggleSupportModuleAction(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  moduleIndex: number,
): TypePlayer {
  return applyModuleUpdater(player, pilotInfo, (modules) =>
    modules.map((m: VehicleModule, idx: number) =>
      idx === moduleIndex ? { ...m, enabled: !m.enabled } : m,
    ),
  );
}

// Vehicle enter / exit

/**
 * Toggle the active vehicle: if one is active, disable all vehicles;
 * otherwise enable the first vehicle in the list.
 */
export function toggleActiveVehicle(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const spell = (player.classes ?? [])[classIndex]?.spells?.[spellIndex];
  const vehicles = Array.isArray(spell?.vehicles)
    ? spell.vehicles
    : Array.isArray(spell?.currentVehicles)
      ? spell.currentVehicles
      : [];
  const isActive = vehicles.some((v: Vehicle) => v.enabled);
  const classes = (player.classes ?? []).map((cls: PlayerClass, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: Spells, si: number) => {
            if (si !== spellIndex) return s;
            const baseVehicles = Array.isArray(s.vehicles)
              ? s.vehicles
              : Array.isArray(s.currentVehicles)
                ? s.currentVehicles
                : [];
            const updatedVehicles = baseVehicles.map(
              (v: Vehicle, vi: number) =>
                isActive
                  ? { ...v, enabled: false }
                  : { ...v, enabled: vi === 0 },
            );
            return {
              ...s,
              vehicles: updatedVehicles,
              currentVehicles: updatedVehicles,
            };
          }),
        },
  );
  return syncSlots({ ...player, classes });
}

export function enterVehicleAction(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  vehicleIndex: number,
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const classes = (player.classes ?? []).map((cls: PlayerClass, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: Spells, si: number) => {
            if (si !== spellIndex) return s;
            const baseVehicles = Array.isArray(s.vehicles)
              ? s.vehicles
              : Array.isArray(s.currentVehicles)
                ? s.currentVehicles
                : [];
            const updatedVehicles = baseVehicles.map(
              (v: Vehicle, vi: number) => ({
                ...v,
                enabled: vi === vehicleIndex,
              }),
            );
            return {
              ...s,
              vehicles: updatedVehicles,
              currentVehicles: updatedVehicles,
            };
          }),
        },
  );
  return syncSlots({ ...player, classes });
}

/**
 * Persist changes from the vehicle configuration modal (vehicles list + showInPlayerSheet).
 */
export function saveVehiclesAction(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  updatedPilot: { vehicles: Vehicle[]; showInPlayerSheet?: boolean },
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const currentSpell = (player.classes ?? [])[classIndex]?.spells?.[spellIndex];
  const existingVehicles = Array.isArray(currentSpell?.vehicles)
    ? currentSpell.vehicles
    : Array.isArray(currentSpell?.currentVehicles)
      ? currentSpell.currentVehicles
      : [];
  const isGenericModuleName = (name: string | undefined) =>
    name === "pilot_module_armor" ||
    name === "pilot_module_weapon" ||
    name === "pilot_module_support";
  const normalizedVehicles = (updatedPilot.vehicles ?? []).map(
    (vehicle: Vehicle, vi: number) => {
      const prevVehicle = existingVehicles?.[vi];
      const prevModules = prevVehicle?.modules ?? [];
      const modules = (vehicle.modules ?? []).map((module, mi) => {
        const prevModule = prevModules?.[mi];
        const nextName =
          !module?.name || isGenericModuleName(module.name)
            ? module?.key && !isGenericModuleName(module.key)
              ? module.key
              : prevModule?.key && !isGenericModuleName(prevModule.key)
                ? prevModule.key
                : prevModule?.name && !isGenericModuleName(prevModule.name)
                  ? prevModule.name
                  : module?.name
            : module.name;
        return {
          ...module,
          name: nextName,
          customName:
            module?.customName ??
            prevModule?.customName ??
            "",
          description:
            module?.description ??
            prevModule?.description ??
            "",
        };
      });
      return { ...vehicle, modules };
    },
  );
  const classes = (player.classes ?? []).map((cls: PlayerClass, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: Spells, si: number) =>
            si !== spellIndex
              ? s
              : {
                  ...s,
                  vehicles: normalizedVehicles,
                  currentVehicles: normalizedVehicles,
                  showInPlayerSheet: updatedPilot.showInPlayerSheet,
                },
          ),
        },
  );
  return syncSlots({ ...player, classes });
}

// Transforming weapon

/**
 * Swap the active form (primary ↔ secondary) of a transforming custom weapon
 * in the given slot.
 */
export function swapTransformingWeaponForm(
  player: TypePlayer,
  slot: string,
): TypePlayer {
  const resolved = resolveEffectiveSlot(player, slot as keyof EquippedSlots);
  if (resolved?.kind !== "playerItem") return player;
  const item = resolved.item as AnyEquipmentItem;
  if (
    !("customizations" in item) ||
    !item?.customizations?.some(
      (c: CustomWeaponCustomization) =>
        c.name === "weapon_customization_transforming",
    )
  ) {
    return player;
  }

  const inv = player.equipment?.[0];
  if (!inv) return player;

  const customWeapons = (inv.customWeapons ?? []).map((cw: AnyEquipmentItem) =>
    cw.name === item.name
      ? {
          ...cw,
          activeForm:
            "activeForm" in cw
              ? cw.activeForm === "secondary"
                ? "primary"
                : "secondary"
              : "primary",
        }
      : cw,
  );
  const eq0 = { ...inv, customWeapons } as unknown as PlayerEquipment;
  const equipment = (
    player.equipment ? [eq0, ...player.equipment.slice(1)] : [eq0]
  ) as TypePlayer["equipment"];
  return syncSlots({ ...player, equipment });
}
