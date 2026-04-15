import { TypePlayer, EquippedSlots, AnyEquipmentItem, PlayerClass, Spells, VehicleModule, Vehicle } from '../../../../types/Players';
import { resolveEffectiveSlot, syncSlots } from './equipmentSlots';
import type { PilotSpellInfo } from './loadoutSelectors';

// Types

/** Candidate item from the slot picker. Matches the shape SlotPickerDialog builds. */
export type PickerCandidate = {
  source: 'weapons' | 'customWeapons' | 'armor' | 'shields' | 'accessories';
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
    [source]: updater(((player.equipment?.[0] as Record<string, AnyEquipmentItem[]> | undefined)?.[source] ?? []) as AnyEquipmentItem[]),
  };
  // Cast through any: the spread always preserves the required fields when
  // equipment[0] exists; the fallback `{}` case only arises for players with
  // no inventory, which is treated as an empty-but-valid entry.
  const equipment = (
    player.equipment ? [eq0, ...player.equipment.slice(1)] : [eq0]
  ) as TypePlayer['equipment'];
  return { ...player, equipment };
}

function applyModuleUpdater(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  updaterFn: (modules: VehicleModule[]) => VehicleModule[],
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
                    : (Array.isArray(s.currentVehicles) ? s.currentVehicles : []);
                  const updatedVehicles = vehicles.map((v: Vehicle) =>
                    !v.enabled ? v : { ...v, modules: updaterFn(v.modules ?? []) },
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

// Equip / Unequip

/**
 * Equip `candidate` into `slot`, unequipping whatever was there before.
 * If a two-handed weapon is assigned to mainHand, offHand is also cleared.
 * Ends with `syncSlots` so both equippedSlots and vehicleSlots are consistent.
 */
export function equipItemToSlot(
  player: TypePlayer,
  slot: string,
  candidate: PickerCandidate,
): TypePlayer {
  const currentRef = player.equippedSlots?.[slot as keyof EquippedSlots];
  const isCustom = candidate.source === 'customWeapons';
  const isTwoHand = isCustom || (candidate.item?.hands === 2) || (candidate.item?.isTwoHand ?? false);

  let updated = player;

  // Un-equip the item currently in this slot
  if (currentRef) {
    updated = patchInv(updated, currentRef.source, arr =>
      arr.map((it: AnyEquipmentItem, idx: number) => {
        const match =
          currentRef.index !== undefined ? idx === currentRef.index : it.name === currentRef.name;
        return match ? { ...it, isEquipped: false } : it;
      }),
    );
  }

  // Two-handed to mainHand: also clear offHand
  if (slot === 'mainHand' && isTwoHand) {
    const offRef = updated.equippedSlots?.offHand;
    if (offRef) {
      updated = patchInv(updated, offRef.source, arr =>
        arr.map((it: AnyEquipmentItem, idx: number) => {
          const match =
            offRef.index !== undefined ? idx === offRef.index : it.name === offRef.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    }
  }

  // Equip the new item
  updated = patchInv(updated, candidate.source, arr =>
    arr.map((it: AnyEquipmentItem, idx: number) => {
      const match =
        candidate.index !== undefined ? idx === candidate.index : it.name === candidate.label;
      return match ? { ...it, isEquipped: true } : it;
    }),
  );

  return syncSlots(updated);
}

/**
 * Remove whatever is in `slot`, marking the item as unequipped.
 * Ends with `syncSlots`.
 */
export function clearSlotAction(player: TypePlayer, slot: string): TypePlayer {
  const currentRef = player.equippedSlots?.[slot as keyof EquippedSlots];
  if (!currentRef) return player;

  const updated = patchInv(player, currentRef.source, arr =>
    arr.map((it: AnyEquipmentItem, idx: number) => {
      const match =
        currentRef.index !== undefined ? idx === currentRef.index : it.name === currentRef.name;
      return match ? { ...it, isEquipped: false } : it;
    }),
  );

  return syncSlots(updated);
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
  return applyModuleUpdater(player, pilotInfo, modules => {
    const targetSlot = slot === 'armor' ? 'armor' : slot === 'mainHand' ? 'main' : 'off';
    const targetModule = modules[moduleIndex];
    if (!targetModule) return modules;
    const selectingArmor = slot === 'armor';
    const selectingWeapon = slot === 'mainHand' || slot === 'offHand';

    const normalizeWeaponSlot = (raw: string | null | undefined, module: VehicleModule): 'main' | 'off' | 'both' => {
      if (raw === 'both') return 'both';
      if (raw === 'main' || raw === 'mainHand') return 'main';
      if (raw === 'off' || raw === 'offHand') return 'off';
      return module?.isShield ? 'off' : 'main';
    };

    const isWeaponActive = (m: VehicleModule): boolean =>
      m.type === 'pilot_module_weapon' && (m.enabled || m.equipped);

    const occupies = (m: VehicleModule, hand: 'main' | 'off'): boolean => {
      const s = normalizeWeaponSlot(m.equippedSlot, m);
      return s === 'both' || s === hand;
    };

    const otherActiveWeapons = modules.filter((m: VehicleModule, idx: number) => idx !== moduleIndex && isWeaponActive(m));

    let resolvedWeaponSlot: 'main' | 'off' | 'both' = targetSlot as 'main' | 'off' | 'both';
    if (selectingWeapon) {
      if (targetModule.cumbersome) {
        resolvedWeaponSlot = 'both';
      } else if (targetModule.isShield) {
        const mainOccupied = otherActiveWeapons.some((m: VehicleModule) => occupies(m, 'main'));
        const offOccupied = otherActiveWeapons.some((m: VehicleModule) => occupies(m, 'off'));
        const offShieldExists = otherActiveWeapons.some(
          (m: VehicleModule) => m.isShield && occupies(m, 'off'),
        );
        const requestedMain = targetSlot === 'main';

        if (requestedMain) {
          // Main-hand shield is legal only when another shield occupies off-hand.
          if (!(offShieldExists && !mainOccupied)) return modules;
          resolvedWeaponSlot = 'main';
        } else {
          if (!offOccupied) {
            resolvedWeaponSlot = 'off';
          } else if (offShieldExists && !mainOccupied) {
            // Second shield can move to main hand.
            resolvedWeaponSlot = 'main';
          } else {
            return modules;
          }
        }
      } else {
        resolvedWeaponSlot = targetSlot as 'main' | 'off';
      }
    }

    return modules.map((m: VehicleModule, idx: number) => {
      const isTarget = idx === moduleIndex;
      const isCorrectType =
        (selectingArmor && m.type === 'pilot_module_armor') ||
        (selectingWeapon && m.type === 'pilot_module_weapon');
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
      const takingMain = resolvedWeaponSlot === 'main' || resolvedWeaponSlot === 'both';
      const takingOff = resolvedWeaponSlot === 'off' || resolvedWeaponSlot === 'both';
      const wasInMain = m.equippedSlot === 'main' || m.equippedSlot === 'mainHand' || m.equippedSlot === 'both';
      const wasInOff = m.equippedSlot === 'off' || m.equippedSlot === 'offHand' || m.equippedSlot === 'both';
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
  return applyModuleUpdater(player, pilotInfo, modules =>
    modules.map((m: VehicleModule) => {
      const matches =
        (slot === 'armor' && m.type === 'pilot_module_armor') ||
        (slot === 'mainHand' &&
          m.type === 'pilot_module_weapon' &&
          (m.equippedSlot === 'main' || m.equippedSlot === 'mainHand' || m.equippedSlot === 'both')) ||
        (slot === 'offHand' &&
          m.type === 'pilot_module_weapon' &&
          (m.equippedSlot === 'off' || m.equippedSlot === 'offHand' || m.equippedSlot === 'both'));
      return matches ? { ...m, enabled: false } : m;
    }),
  );
}

/**
 * Toggle `enabled` on a support module by its original array index.
 */
export function toggleSupportModuleAction(
  player: TypePlayer,
  pilotInfo: PilotSpellInfo,
  moduleIndex: number,
): TypePlayer {
  return applyModuleUpdater(player, pilotInfo, modules =>
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
    : (Array.isArray(spell?.currentVehicles) ? spell.currentVehicles : []);
  const isActive = vehicles.some(
    (v: Vehicle) => v.enabled,
  );
  const classes = (player.classes ?? []).map((cls: PlayerClass, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: Spells, si: number) => {
            if (si !== spellIndex) return s;
            const baseVehicles = Array.isArray(s.vehicles)
              ? s.vehicles
              : (Array.isArray(s.currentVehicles) ? s.currentVehicles : []);
            const updatedVehicles = baseVehicles.map((v: Vehicle, vi: number) =>
              isActive ? { ...v, enabled: false } : { ...v, enabled: vi === 0 },
            );
            return { ...s, vehicles: updatedVehicles, currentVehicles: updatedVehicles };
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
                  vehicles: updatedPilot.vehicles,
                  currentVehicles: updatedPilot.vehicles,
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
export function swapTransformingWeaponForm(player: TypePlayer, slot: string): TypePlayer {
  const resolved = resolveEffectiveSlot(player, slot as keyof EquippedSlots);
  if (resolved?.kind !== 'playerItem') return player;
  const item = resolved.item as AnyEquipmentItem;
  if (!('customizations' in item) || !item?.customizations?.some((c: Record<string, unknown>) => c.name === 'weapon_customization_transforming')) {
    return player;
  }

  const inv = player.equipment?.[0];
  if (!inv) return player;

  const customWeapons = (inv.customWeapons ?? []).map((cw: AnyEquipmentItem) =>
    cw.name === item.name
      ? { ...cw, activeForm: ('activeForm' in cw ? cw.activeForm === 'secondary' ? 'primary' : 'secondary' : 'primary') }
      : cw,
  );
  const eq0 = { ...inv, customWeapons };
  const equipment = player.equipment ? [eq0, ...player.equipment.slice(1)] : [eq0];
  return syncSlots({ ...player, equipment });
}
