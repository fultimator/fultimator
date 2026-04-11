import { TypePlayer, EquippedSlots } from '../../../../types/Players';
import { resolveEffectiveSlot, syncSlots } from './equipmentSlots';
import type { PilotSpellInfo } from './loadoutSelectors';

// Types

/** Candidate item from the slot picker. Matches the shape SlotPickerDialog builds. */
export type PickerCandidate = {
  source: 'weapons' | 'customWeapons' | 'armor' | 'shields' | 'accessories';
  /** Item display name (matches item.name). */
  label: string;
  index: number;
  item: any;
};

// Internal helpers

function patchInv(
  player: TypePlayer,
  source: string,
  updater: (arr: any[]) => any[],
): TypePlayer {
  const eq0 = {
    ...(player.equipment?.[0] ?? {}),
    [source]: updater((player.equipment?.[0] as any)?.[source] ?? []),
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
  updaterFn: (modules: any[]) => any[],
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const classes = (player.classes ?? []).map((cls: any, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: any, si: number) =>
            si !== spellIndex
              ? s
              : {
                  ...s,
                  vehicles: (s.vehicles ?? []).map((v: any) =>
                    !v.enabled ? v : { ...v, modules: updaterFn(v.modules ?? []) },
                  ),
                },
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
  const currentRef = (player.equippedSlots as any)?.[slot];
  const isCustom = candidate.source === 'customWeapons';
  const isTwoHand = isCustom || (candidate.item?.hands === 2) || (candidate.item?.isTwoHand ?? false);

  let updated = player;

  // Un-equip the item currently in this slot
  if (currentRef) {
    updated = patchInv(updated, currentRef.source, arr =>
      arr.map((it: any, idx: number) => {
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
        arr.map((it: any, idx: number) => {
          const match =
            offRef.index !== undefined ? idx === offRef.index : it.name === offRef.name;
          return match ? { ...it, isEquipped: false } : it;
        }),
      );
    }
  }

  // Equip the new item
  updated = patchInv(updated, candidate.source, arr =>
    arr.map((it: any, idx: number) => {
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
  const currentRef = (player.equippedSlots as any)?.[slot];
  if (!currentRef) return player;

  const updated = patchInv(player, currentRef.source, arr =>
    arr.map((it: any, idx: number) => {
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

    return modules.map((m: any, idx: number) => {
      if (!m.equipped) return m;
      const isTarget = idx === moduleIndex;
      const isCorrectType =
        (slot === 'armor' && m.type === 'pilot_module_armor') ||
        (['mainHand', 'offHand'].includes(slot) && m.type === 'pilot_module_weapon');
      if (!isCorrectType) return m;
      if (isTarget) {
        return { ...m, enabled: true, equippedSlot: m.cumbersome ? 'both' : targetSlot };
      }
      // Disable other modules that collide with the newly activated one
      const takingMain = targetSlot === 'main' || targetModule.cumbersome;
      const takingOff = targetSlot === 'off' || targetModule.cumbersome;
      const wasInMain = m.equippedSlot === 'main' || m.equippedSlot === 'both';
      const wasInOff = m.equippedSlot === 'off' || m.equippedSlot === 'both';
      if ((takingMain && wasInMain) || (takingOff && wasInOff)) return { ...m, enabled: false };
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
    modules.map((m: any) => {
      if (!m.equipped) return m;
      const matches =
        (slot === 'armor' && m.type === 'pilot_module_armor') ||
        (slot === 'mainHand' &&
          m.type === 'pilot_module_weapon' &&
          (m.equippedSlot === 'main' || m.equippedSlot === 'both')) ||
        (slot === 'offHand' &&
          m.type === 'pilot_module_weapon' &&
          (m.equippedSlot === 'off' || m.equippedSlot === 'both'));
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
    modules.map((m: any, idx: number) =>
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
  const isActive = (player.classes as any)?.[classIndex]?.spells?.[spellIndex]?.vehicles?.some(
    (v: any) => v.enabled,
  );
  const classes = (player.classes ?? []).map((cls: any, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: any, si: number) => {
            if (si !== spellIndex) return s;
            const vehicles = (s.vehicles ?? []).map((v: any, vi: number) =>
              isActive ? { ...v, enabled: false } : { ...v, enabled: vi === 0 },
            );
            return { ...s, vehicles };
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
  updatedPilot: { vehicles: any[]; showInPlayerSheet?: boolean },
): TypePlayer {
  const { classIndex, spellIndex } = pilotInfo;
  const classes = (player.classes ?? []).map((cls: any, ci: number) =>
    ci !== classIndex
      ? cls
      : {
          ...cls,
          spells: (cls.spells ?? []).map((s: any, si: number) =>
            si !== spellIndex
              ? s
              : {
                  ...s,
                  vehicles: updatedPilot.vehicles,
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
  const item = resolved.item as any;
  if (!item?.customizations?.some((c: any) => c.name === 'weapon_customization_transforming')) {
    return player;
  }

  const inv = player.equipment?.[0];
  if (!inv) return player;

  const customWeapons = (inv.customWeapons ?? []).map((cw: any) =>
    cw.name === item.name
      ? { ...cw, activeForm: cw.activeForm === 'secondary' ? 'primary' : 'secondary' }
      : cw,
  );
  const eq0 = { ...inv, customWeapons };
  const equipment = player.equipment ? [eq0, ...player.equipment.slice(1)] : [eq0];
  return syncSlots({ ...player, equipment });
}
