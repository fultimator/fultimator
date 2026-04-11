import { TypePlayer } from '../../../../types/Players';
import {
  resolveEffectiveSlot,
  getActiveVehicle,
  isTwoHandedEquipped,
  isItemEquipped,
  ResolvedVehicleModule,
} from './equipmentSlots';
import { availableFrames } from '../../../../libs/pilotVehicleData';
import { getModuleTypeForLimits } from '../../spells/vehicleReducer';

// Types

export type PilotSpellInfo = {
  spell: any;
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
    for (const [si, spell] of ((cls as any).spells ?? []).entries()) {
      if ((spell as any).spellType === 'pilot-vehicle') {
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
export function getEquippedModulesForSlot(player: TypePlayer, slot: string): IndexedModule[] {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return [];
  return vehicle.modules
    .map((m, originalIndex) => ({ ...m, originalIndex }))
    .filter(m => {
      if (slot === 'armor') return m.type === 'pilot_module_armor';
      if (slot === 'mainHand' || slot === 'offHand') return m.type === 'pilot_module_weapon';
      return false;
    }) as IndexedModule[];
}

/**
 * The single active module for `slot` (the one whose equippedSlot matches),
 * or the first installed module for that slot type, or null.
 */
export function getEquippedModuleForSlot(player: TypePlayer, slot: string): IndexedModule | null {
  const mods = getEquippedModulesForSlot(player, slot);
  const activeMods = mods.filter(m => m.enabled || m.equipped);
  return (
    activeMods.find(m => {
      if (slot === 'armor') return (m as any).equippedSlot === 'armor';
      if (slot === 'mainHand')
        return (m as any).equippedSlot === 'main'
          || (m as any).equippedSlot === 'mainHand'
          || (m as any).equippedSlot === 'both';
      if (slot === 'offHand')
        return (m as any).equippedSlot === 'off'
          || (m as any).equippedSlot === 'offHand'
          || (m as any).equippedSlot === 'both';
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
export function getSlotLocks(
  player: TypePlayer,
): { mainHandLocked: boolean; offHandLocked: boolean } {
  const mainHandResolved = resolveEffectiveSlot(player, 'mainHand');
  const offHandResolved = resolveEffectiveSlot(player, 'offHand');

  const mainHandLocked = !!(
    offHandResolved?.kind === 'vehicleModule' && !getEquippedModuleForSlot(player, 'mainHand')
  );

  const offHandLocked = (() => {
    if (mainHandResolved?.kind === 'vehicleModule') {
      if (mainHandResolved.module.cumbersome) return true;
      if (!getEquippedModuleForSlot(player, 'offHand')) return true;
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
    availableFrames.find((f: any) => f.name === (vehicle as any).frame) ??
    ({ limits: { weapon: 2, armor: 1, support: -1 } } as any);

  const counts: Record<string, number> = { weapon: 0, armor: 0, support: 0 };
  for (const m of vehicle.modules) {
    if (!m.equipped) continue;
    const type = getModuleTypeForLimits(m);
    if (type === 'custom') continue;
    counts[type] += type === 'support' && m.isComplex ? 2 : 1;
  }
  return { counts, limits: (frame as any).limits };
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
    .filter(m => m.equipped && m.type === 'pilot_module_support') as IndexedModule[];
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
    .map(ref => {
      if (!ref) return null;
      const key = `${ref.vehicleName}|${ref.moduleName}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const module =
        vehicle?.modules.find(m => m.name === ref.moduleName && m.enabled) ?? null;
      return { ref, module } as SupportSlotEntry;
    })
    .filter((e): e is SupportSlotEntry => e !== null);
}

// Aux hand

/**
 * Synthesise the "Twin Shields" aux hand weapon when the Dual Shieldbearer skill
 * is active and 2 shields are equipped.  Returns null otherwise.
 */
export function getAuxHandItem(player: TypePlayer): AuxHandItem | null {
  const hasDualShieldBearer = (player.classes ?? []).some((cls: any) =>
    (cls.skills ?? []).some(
      (sk: any) => sk.specialSkill === 'Dual Shieldbearer' && sk.currentLvl === 1,
    ),
  );
  if (!hasDualShieldBearer) return null;

  const inv = player.equipment?.[0];
  const equippedShieldsCount = (inv?.shields ?? []).filter(s => isItemEquipped(player, s)).length;
  if (equippedShieldsCount < 2) return null;

  const defensiveMasteryBonus = (player.classes ?? [])
    .flatMap((cls: any) => cls.skills ?? [])
    .filter((sk: any) => sk.specialSkill === 'Defensive Mastery')
    .reduce((sum: number, sk: any) => sum + (sk.currentLvl ?? 0), 0);

  return {
    name: 'Twin Shields',
    att1: 'might',
    att2: 'might',
    damage: 5 + defensiveMasteryBonus,
    prec: 0,
    type: 'physical',
    hands: 2,
    melee: true,
  };
}
