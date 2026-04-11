import {
  TypePlayer,
  EquippedSlots,
  SlotRef,
  VehicleSlots,
  VehicleModuleRef,
  Weapons,
  CustomWeapons,
  Armor,
  Shields,
  Accessories,
} from '../../../../types/Players';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnyEquipmentItem =
  | Weapons
  | CustomWeapons
  | Armor
  | Shields
  | Accessories;

export type ResolvedPlayerItem = AnyEquipmentItem;

export type ResolvedVehicleModule = {
  name: string;
  type: string;
  equippedSlot: string | null;
  enabled: boolean;
  equipped: boolean;
  isShield?: boolean;
  cumbersome?: boolean;
  def?: number;
  mdef?: number;
  damage?: number;
  prec?: number;
  range?: string;
  damageType?: string;
  att1?: string;
  att2?: string;
  customName?: string;
  description?: string;
  isComplex?: boolean;
};

export type ResolvedVehicle = {
  customName: string;
  enabled: boolean;
  modules: ResolvedVehicleModule[];
};

export type ResolvedSlot =
  | { kind: 'playerItem'; item: ResolvedPlayerItem }
  | { kind: 'vehicleModule'; module: ResolvedVehicleModule; vehicle: ResolvedVehicle };

// ─── Vehicle helpers ──────────────────────────────────────────────────────────

/** Find the pilot spell, if any. */
function findPilotSpell(player: TypePlayer): { vehicles: ResolvedVehicle[] } | null {
  for (const cls of player.classes ?? []) {
    for (const spell of cls.spells ?? []) {
      if ((spell as any).spellType === 'pilot-vehicle') return spell as any;
    }
  }
  return null;
}

function getPilotVehicles(pilotSpell: any): ResolvedVehicle[] {
  if (!pilotSpell) return [];
  const vehicles = pilotSpell.vehicles ?? pilotSpell.currentVehicles ?? [];
  return Array.isArray(vehicles) ? vehicles : [];
}

/** Return the currently enabled vehicle, or null. */
export function getActiveVehicle(player: TypePlayer): ResolvedVehicle | null {
  const pilot = findPilotSpell(player);
  if (!pilot) return null;
  return getPilotVehicles(pilot).find(v => v.enabled) ?? null;
}

// ─── deriveVehicleSlots ───────────────────────────────────────────────────────

/**
 * Build VehicleSlots from the active vehicle's module state.
 * Only modules where `module.enabled === true` contribute to overrides.
 * Called after every module enabled/equipped change.
 */
export function deriveVehicleSlots(player: TypePlayer): VehicleSlots {
  const vehicle = getActiveVehicle(player);
  if (!vehicle) return {};

  const slots: VehicleSlots = {
    mainHand:  null,
    offHand:   null,
    armor:     null,
    accessory: null,
    support:   [],
  };

  const ref = (m: ResolvedVehicleModule): VehicleModuleRef => ({
    vehicleName: vehicle.customName,
    moduleName:  m.name,
  });

  for (const module of vehicle.modules) {
    if (!module.enabled) continue;

    if (module.type === 'pilot_module_weapon') {
      if (module.equippedSlot === 'main') {
        slots.mainHand = ref(module);
      } else if (module.equippedSlot === 'off') {
        slots.offHand = ref(module);
      } else if (module.equippedSlot === 'both') {
        // Cumbersome — occupies both hands
        slots.mainHand = ref(module);
        slots.offHand  = ref(module);
      }
    } else if (module.type === 'pilot_module_armor') {
      slots.armor = ref(module);
    } else if (module.type === 'pilot_module_accessory') {
      slots.accessory = ref(module);
    } else if (module.type === 'pilot_module_support') {
      const count = module.isComplex ? 2 : 1;
      for (let i = 0; i < count; i++) slots.support!.push(ref(module));
    }
  }

  return slots;
}

// ─── deriveEquippedSlots ──────────────────────────────────────────────────────

/**
 * Build EquippedSlots by scanning `isEquipped` flags on the player's item
 * arrays. Called by syncSlots after every equip change so `equippedSlots`
 * always reflects the current `isEquipped` state. Also used as the one-time
 * lazy migration for players that have no `equippedSlots` yet.
 *
 * Heuristic for weapons:
 *   - Two-handed / custom weapon → mainHand only
 *   - First one-handed equipped weapon  → mainHand (if not taken)
 *   - Second one-handed equipped weapon → offHand
 *   - First equipped shield             → offHand (or mainHand if Dual Shieldbearer + offHand taken)
 */
export function deriveEquippedSlots(player: TypePlayer): EquippedSlots {
  const hasDualShieldBearer = player.classes?.some(cls =>
    cls.skills?.some(
      sk => (sk as any).specialSkill === 'Dual Shieldbearer' && sk.currentLvl === 1
    )
  ) ?? false;

  const slots: EquippedSlots = {
    mainHand:  null,
    offHand:   null,
    armor:     null,
    accessory: null,
  };

  const inv = player.equipment?.[0];
  if (!inv) return slots;

  // Helper to build a SlotRef with index
  const ref = (source: SlotRef['source'], name: string, index: number): SlotRef =>
    ({ source, name, index });

  // Custom weapons are always two-handed (occupy both hands, but not armor/accessory)
  const customWeapons = inv.customWeapons ?? [];
  const firstEquippedCustomIdx = customWeapons.findIndex(w => w.isEquipped);
  if (firstEquippedCustomIdx >= 0) {
    const cw = customWeapons[firstEquippedCustomIdx];
    slots.mainHand = ref('customWeapons', cw.name, firstEquippedCustomIdx);
    // offHand is locked (two-handed), skip regular weapon/shield logic
  } else {
    // Regular weapons
    const weapons = inv.weapons ?? [];
    for (let i = 0; i < weapons.length; i++) {
      const w = weapons[i];
      if (!w.isEquipped) continue;
      const is2H = w.isTwoHand;
      if (is2H) {
        slots.mainHand = ref('weapons', w.name, i);
        break;
      } else {
        if (!slots.mainHand) {
          slots.mainHand = ref('weapons', w.name, i);
        } else if (!slots.offHand) {
          slots.offHand = ref('weapons', w.name, i);
          break;
        }
      }
    }

    // Shields
    const shields = inv.shields ?? [];
    for (let i = 0; i < shields.length; i++) {
      const s = shields[i];
      if (!s.isEquipped) continue;
      if (!slots.offHand) {
        slots.offHand = ref('shields', s.name, i);
      } else if (hasDualShieldBearer && !slots.mainHand) {
        slots.mainHand = ref('shields', s.name, i);
      }
    }
  }

  // Armor (only one allowed)
  const armorArr = inv.armor ?? [];
  const armorIdx = armorArr.findIndex(a => a.isEquipped);
  if (armorIdx >= 0) {
    slots.armor = ref('armor', armorArr[armorIdx].name, armorIdx);
  }

  // Accessory (only one allowed)
  const accessoriesArr = inv.accessories ?? [];
  const accIdx = accessoriesArr.findIndex(a => a.isEquipped);
  if (accIdx >= 0) {
    slots.accessory = ref('accessories', accessoriesArr[accIdx].name, accIdx);
  }

  return slots;
}

// ─── isItemEquipped ───────────────────────────────────────────────────────────

/**
 * Compatibility shim — use this instead of reading item.isEquipped directly
 * in stat calculations and display code.
 *
 * If `player.equippedSlots` exists → returns true if the item's name appears
 * in any of the four named slots. (equippedSlots is always present after
 * syncSlots has run; the fallback path covers unmigrated players loaded
 * read-only without going through the editor.)
 *
 * If `player.equippedSlots` is absent → falls back to item.isEquipped
 * (legacy behavior for old players not yet migrated).
 *
 * Note: matching is by name only. Name collisions across sources are a known
 * low-risk edge case (see plan risk table).
 */
export function isItemEquipped(player: TypePlayer, item: AnyEquipmentItem): boolean {
  const slots = player.equippedSlots;
  if (!slots) return (item as any).isEquipped ?? false;

  const name = (item as any).name as string;
  const inv  = player.equipment?.[0];

  const matchesRef = (ref: SlotRef | null | undefined): boolean => {
    if (!ref || ref.name !== name) return false;
    if (ref.index !== undefined) {
      // Index-aware match: only the item at that exact position qualifies
      const arr = (inv as any)?.[ref.source] as AnyEquipmentItem[] | undefined;
      return arr?.[ref.index] === item;
    }
    // Legacy: name-only (backward compat for refs without an index)
    return true;
  };

  return !!(
    matchesRef(slots.mainHand) ||
    matchesRef(slots.offHand)  ||
    matchesRef(slots.armor)    ||
    matchesRef(slots.accessory)
  );
}

// ─── isTwoHandedEquipped ──────────────────────────────────────────────────────

/**
 * Returns true when Main Hand holds a two-handed weapon OR any customWeapon.
 * Use this instead of duplicating the isTwoHand / customWeapons logic inline.
 */
export function isTwoHandedEquipped(player: TypePlayer): boolean {
  const ref = player.equippedSlots?.mainHand;
  if (!ref) return false;
  if (ref.source === 'customWeapons') return true;
  const inv = player.equipment?.[0];
  const w = ref.index !== undefined
    ? (inv?.weapons ?? [])[ref.index]
    : (inv?.weapons ?? []).find(x => x.name === ref.name);
  return w?.isTwoHand || false;
}

// ─── validateSlots ────────────────────────────────────────────────────────────

/**
 * Reconcile equippedSlots against the current inventory.
 * Clears any slot whose referenced item no longer exists.
 * Also enforces:
 *   - Dual Shieldbearer rule (clears mainHand shield if skill is gone)
 *   - Two-handed / customWeapon in mainHand forces offHand to null
 *
 * Returns a new player object. Safe to call on every load.
 */
export function validateSlots(player: TypePlayer): TypePlayer {
  if (!player.equippedSlots) return player;

  const hasDualShieldBearer = player.classes?.some(cls =>
    cls.skills?.some(
      sk => (sk as any).specialSkill === 'Dual Shieldbearer' && sk.currentLvl === 1
    )
  ) ?? false;

  const slots = { ...player.equippedSlots };

  const inv = player.equipment?.[0];

  // Returns false if the item referenced by ref no longer exists in inventory
  const isValid = (ref: SlotRef | null | undefined): boolean => {
    if (!ref) return true;
    const arr = (inv as any)?.[ref.source] as AnyEquipmentItem[] | undefined;
    if (!arr) return false;
    if (ref.index !== undefined) return !!arr[ref.index];
    return arr.some((it: any) => it.name === ref.name);
  };

  if (!isValid(slots.mainHand))  slots.mainHand  = null;
  if (!isValid(slots.offHand))   slots.offHand   = null;
  if (!isValid(slots.armor))     slots.armor     = null;
  if (!isValid(slots.accessory)) slots.accessory = null;

  // Clear mainHand shield if Dual Shieldbearer was lost
  if (!hasDualShieldBearer && slots.mainHand?.source === 'shields') {
    slots.mainHand = null;
  }

  // Two-handed / customWeapon in mainHand must clear offHand
  if (slots.mainHand) {
    const isCustom = slots.mainHand.source === 'customWeapons';
    const w = isCustom
      ? undefined
      : (slots.mainHand.index !== undefined
          ? (inv?.weapons ?? [])[slots.mainHand.index]
          : (inv?.weapons ?? []).find(x => x.name === slots.mainHand!.name));
    if (isCustom || w?.isTwoHand) slots.offHand = null;
  }

  return { ...player, equippedSlots: slots };
}

// ─── resolveEffectiveSlot ─────────────────────────────────────────────────────

/**
 * Return what is *effectively* occupying a slot right now.
 * Vehicle module overrides player item when:
 *   vehicle.enabled && the matching vehicleSlots entry is non-null
 *
 * For vehicle-only slots (accessory, support) the vehicle always wins
 * when the vehicle is active and a module is in that slot.
 */
export function resolveEffectiveSlot(
  player: TypePlayer,
  slot: keyof EquippedSlots
): ResolvedSlot | null {
  const vehicle = getActiveVehicle(player);
  const vs = player.vehicleSlots;

  if (vehicle && vs) {
    const vRef = vs[slot as keyof VehicleSlots];
    if (vRef && typeof vRef === 'object' && !Array.isArray(vRef)) {
      const module = vehicle.modules.find(
        m => m.name === (vRef as VehicleModuleRef).moduleName && m.enabled
      );
      if (module) return { kind: 'vehicleModule', module, vehicle };
    }

    // Weapon module exclusivity: if one hand uses a module, the other cannot fall back to player items
    if (slot === 'mainHand' || slot === 'offHand') {
      const otherSlot = slot === 'mainHand' ? 'offHand' : 'mainHand';
      if (vs[otherSlot]) return null;
    }
  }

  const ref = player.equippedSlots?.[slot];
  if (!ref) return null;

  const inv = player.equipment?.[0];
  const arr = (inv as any)?.[ref.source] as ResolvedPlayerItem[] | undefined;
  const item = ref.index !== undefined
    ? arr?.[ref.index]
    : arr?.find((it: any) => it.name === ref.name);
  if (!item) return null;

  return { kind: 'playerItem', item };
}

// ─── rehydrateIsEquipped ─────────────────────────────────────────────────────

/**
 * Re-stamps `isEquipped` on all inventory items using `equippedSlots` as the
 * source of truth. Call this once after loading a player from the DB, because
 * `stripLegacyEquipped` removes `isEquipped` from items before saving. While
 * the player is in memory, items must have correct `isEquipped` flags so that
 * `syncSlots` / `deriveEquippedSlots` can work correctly on every equip change.
 *
 * Do NOT call this inside `syncSlots` — doing so would overwrite explicit
 * equip/unequip changes with the stale pre-change slot state.
 */
export function rehydrateIsEquipped(player: TypePlayer): TypePlayer {
  const slots = player.equippedSlots;
  if (!slots) return player;

  const inv = player.equipment?.[0];
  if (!inv) return player;

  const inSlot = (source: string, name: string, index: number): boolean => {
    const check = (ref: SlotRef | null | undefined): boolean => {
      if (!ref || ref.source !== source || ref.name !== name) return false;
      return ref.index === undefined || ref.index === index;
    };
    return !!(check(slots.mainHand) || check(slots.offHand) || check(slots.armor) || check(slots.accessory));
  };

  const eq0 = {
    ...inv,
    weapons:       (inv.weapons       ?? []).map((w, i) => ({ ...w, isEquipped: inSlot('weapons',       w.name, i) })),
    customWeapons: (inv.customWeapons  ?? []).map((w, i) => ({ ...w, isEquipped: inSlot('customWeapons', w.name, i) })),
    shields:       (inv.shields        ?? []).map((s, i) => ({ ...s, isEquipped: inSlot('shields',       s.name, i) })),
    armor:         (inv.armor          ?? []).map((a, i) => ({ ...a, isEquipped: inSlot('armor',         a.name, i) })),
    accessories:   (inv.accessories    ?? []).map((a, i) => ({ ...a, isEquipped: inSlot('accessories',   a.name, i) })),
  };

  const equipment = player.equipment ? [eq0, ...player.equipment.slice(1)] : [eq0];
  return { ...player, equipment };
}

// ─── syncSlots ────────────────────────────────────────────────────────────────

/**
 * After any equip change, call this to re-derive both slot caches and
 * return a new player object ready to pass to setPlayer.
 *
 * This keeps equippedSlots as the authoritative source going forward —
 * all stat reads should use isItemEquipped(player, item) rather than
 * item.isEquipped directly.
 */
export function syncSlots(player: TypePlayer): TypePlayer {
  return {
    ...player,
    equippedSlots: deriveEquippedSlots(player),
    vehicleSlots:  deriveVehicleSlots(player),
  };
}
