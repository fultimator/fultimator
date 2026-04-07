import { TypePlayer } from '../../types/Players';
import {
  syncSlots,
  validateSlots,
  rehydrateIsEquipped,
} from './equipment/slots/equipmentSlots';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayerTransform = (player: TypePlayer) => TypePlayer;

// ─── Pre-save transforms ──────────────────────────────────────────────────────
// Applied before writing to the database. Should produce a clean, minimal
// representation - no runtime-only fields that are re-derived on load.

/**
 * Remove isEquipped flags from all inventory arrays.
 * These are runtime convenience flags re-derived by rehydrateIsEquipped on load.
 * The authoritative source is equippedSlots, so there is no need to persist them.
 * Only runs for migrated players (equippedSlots present) to avoid touching legacy data.
 */
function stripRuntimeEquippedFlags(player: TypePlayer): TypePlayer {
  if (!player.equippedSlots) return player;
  const inv = player.equipment?.[0];
  if (!inv) return player;
  const strip = (arr: any[]) => arr.map(({ isEquipped, ...rest }: any) => rest);
  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons:       strip(inv.weapons       ?? []),
        shields:       strip(inv.shields       ?? []),
        armor:         strip(inv.armor         ?? []),
        accessories:   strip(inv.accessories   ?? []),
        customWeapons: strip((inv as any).customWeapons ?? []),
      },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

const PRE_SAVE_TRANSFORMS: PlayerTransform[] = [
  stripRuntimeEquippedFlags,
];

/** Run all pre-save transforms and return the player ready to write to the DB. */
export function applyPreSaveTransforms(player: TypePlayer): TypePlayer {
  return PRE_SAVE_TRANSFORMS.reduce((p, fn) => fn(p), player);
}

// ─── Post-load transforms ─────────────────────────────────────────────────────
// Applied after reading from the database, before putting the player into state.
// These restore runtime fields and perform one-time schema migrations.

/**
 * First-time migration for players without equippedSlots:
 * derives the slot map from legacy isEquipped flags on inventory items.
 * No-op if equippedSlots already exists.
 */
function migrateEquippedSlots(player: TypePlayer): TypePlayer {
  if (player.equippedSlots) return player;
  return validateSlots(syncSlots(player));
}

/**
 * Restore the isEquipped convenience flags on inventory items from equippedSlots.
 * These are stripped before saving and must be re-added so that runtime code
 * that still reads item.isEquipped directly continues to work.
 */
function restoreRuntimeEquippedFlags(player: TypePlayer): TypePlayer {
  return rehydrateIsEquipped(player);
}

const POST_LOAD_TRANSFORMS: PlayerTransform[] = [
  migrateEquippedSlots,
  restoreRuntimeEquippedFlags,
];

/** Run all post-load transforms and return the player ready for in-memory use. */
export function applyPostLoadTransforms(player: TypePlayer): TypePlayer {
  return POST_LOAD_TRANSFORMS.reduce((p, fn) => fn(p), player);
}

// ─── Migration detection ──────────────────────────────────────────────────────

/**
 * Returns true if the player would be changed by applyPreSaveTransforms +
 * applyPostLoadTransforms. Used by the gallery to detect actors that need a
 * migration pass.
 *
 * A player needs migration when:
 *  - equippedSlots is missing (legacy player - migrateEquippedSlots will add it)
 *  - isEquipped flags are present on inventory items (stripRuntimeEquippedFlags
 *    will remove them on the next save)
 */
export function playerNeedsMigration(player: TypePlayer): boolean {
  const inv = player.equipment?.[0];

  if (!player.equippedSlots) {
    // Only a legacy player if equipment[0] exists — new players have no equipment[0]
    // yet and will get equippedSlots derived on first open/save normally.
    return !!inv;
  }

  // Has equippedSlots but isEquipped flags weren't stripped before the last save.
  if (!inv) return false;
  const sources = ['weapons', 'shields', 'armor', 'accessories', 'customWeapons'] as const;
  return sources.some(k =>
    ((inv as any)[k] ?? []).some((item: any) => 'isEquipped' in item)
  );
}
