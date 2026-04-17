import { TypePlayer } from "../../types/Players";
import {
  syncSlots,
  validateSlots,
  rehydrateIsEquipped,
} from "./equipment/slots/equipmentSlots";

// Types

type PlayerTransform = (player: TypePlayer) => TypePlayer;

// Pre-save transforms
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strip = (arr: Array<Record<string, any>>): any[] =>
    arr.map(({ isEquipped, ...rest }) => rest);
  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons: strip(inv.weapons ?? []) as typeof inv.weapons,
        shields: strip(inv.shields ?? []) as typeof inv.shields,
        armor: strip(inv.armor ?? []) as typeof inv.armor,
        accessories: strip(inv.accessories ?? []) as typeof inv.accessories,
        customWeapons: strip(
          (inv as Record<string, unknown>).customWeapons ?? [],
        ) as typeof inv.customWeapons,
      },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

/**
 * Normalizes settings payload for storage:
 * - Always persists optionalRules with explicit booleans.
 * - Persists only true specialSkillOverrides flags to reduce payload size.
 */
function normalizeSettingsForSave(player: TypePlayer): TypePlayer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawPlayer = player as Record<string, any>;
  const settings = rawPlayer.settings ?? {};
  const rawOptionalRules = settings.optionalRules ?? {};
  const optionalRules = {
    quirks: rawOptionalRules.quirks ?? false,
    campActivities: rawOptionalRules.campActivities ?? false,
    zeroPower: rawOptionalRules.zeroPower ?? false,
    technospheres: rawOptionalRules.technospheres ?? false,
  };

  const rawOverrides = settings.specialSkillOverrides ?? {};
  const specialSkillOverrides = Object.fromEntries(
    Object.entries(rawOverrides).filter(([, value]) => value === true),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextSettings: Record<string, any> = {
    ...settings,
    defaultView: settings.defaultView === "compact" ? "compact" : "normal",
    optionalRules,
  };

  if (Object.keys(specialSkillOverrides).length > 0) {
    nextSettings.specialSkillOverrides = specialSkillOverrides;
  } else {
    delete nextSettings.specialSkillOverrides;
  }

  return {
    ...player,
    settings: nextSettings,
  } as TypePlayer;
}

const PRE_SAVE_TRANSFORMS: PlayerTransform[] = [
  normalizeSettingsForSave,
  stripRuntimeEquippedFlags,
];

/** Run all pre-save transforms and return the player ready to write to the DB. */
export function applyPreSaveTransforms(player: TypePlayer): TypePlayer {
  return PRE_SAVE_TRANSFORMS.reduce((p, fn) => fn(p), player);
}

// Post-load transforms
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
 * Migration for players with equipment arrays at the root level.
 * Moves root-level weapons, armor, etc. into equipment[0].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateLegacyEquipment(player: Record<string, any>): TypePlayer {
  const legacySources = [
    "weapons",
    "shields",
    "armor",
    "accessories",
    "customWeapons",
  ];
  const hasLegacyData = legacySources.some((key) => Array.isArray(player[key]));

  if (!hasLegacyData) return player;

  const eq0: Record<string, unknown> = {
    ...(player.equipment?.[0] ?? {}),
  };

  legacySources.forEach((key) => {
    if (Array.isArray(player[key])) {
      eq0[key] = [...(eq0[key] ?? []), ...player[key]];
      delete player[key];
    }
  });

  return {
    ...player,
    equipment: [eq0, ...(player.equipment?.slice(1) ?? [])],
  } as TypePlayer;
}

/**
 * Ensures all skills use 'currentLvl' instead of the deprecated 'currentSL'.
 */
function normalizeSkillLevels(player: TypePlayer): TypePlayer {
  if (!player.classes) return player;
  const updatedClasses = player.classes.map((cls) => ({
    ...cls,
    skills:
      cls.skills?.map((sk: Record<string, unknown>) => {
        if ("currentSL" in sk && sk.currentSL !== undefined) {
          const { currentSL, ...rest } = sk;
          return { ...rest, currentLvl: currentSL };
        }
        return sk;
      }) ?? [],
  }));
  return { ...player, classes: updatedClasses };
}

/**
 * Ensures 'notes' is always a valid array of PlayerNotes objects.
 * Converts legacy string arrays to objects if needed.
 * Preserves optional metadata fields (clocks, showInPlayerSheet) when present.
 */
function normalizeNotes(player: TypePlayer): TypePlayer {
  if (!player.notes) return { ...player, notes: [] };
  if (!Array.isArray(player.notes)) return { ...player, notes: [] };

  const normalized = player.notes.map((n: unknown): Record<string, unknown> => {
    if (typeof n === "string") return { name: "", description: n };
    if (typeof n === "object" && n !== null) {
      const obj = n as Record<string, unknown>;
      const base: Record<string, unknown> = {
        name: String(obj.name ?? ""),
        description: String(obj.description ?? ""),
      };
      // Preserve optional metadata fields used by sheet rendering
      if (obj.clocks !== undefined) base.clocks = obj.clocks;
      if (obj.showInPlayerSheet !== undefined)
        base.showInPlayerSheet = obj.showInPlayerSheet;
      return base;
    }
    return { name: "", description: "" };
  });

  return { ...player, notes: normalized as unknown as TypePlayer["notes"] };
}

/**
 * Backfill the `index` field on any SlotRef that was saved without one.
 * Legacy equippedSlots entries only contain { source, name }; the index is
 * needed so isItemEquipped can disambiguate items that share the same name.
 * Safe to run on every load — no-ops when index is already present.
 */
function migrateSlotIndexes(player: TypePlayer): TypePlayer {
  const slots = player.equippedSlots;
  if (!slots) return player;

  const inv = player.equipment?.[0];

  const withIndex = (
    ref: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined => {
    if (!ref || ref.index !== undefined) return ref;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (inv as Record<string, any> | undefined)?.[
      ref.source as string
    ] as Array<Record<string, unknown>> | undefined;
    const idx =
      arr?.findIndex((it: Record<string, unknown>) => it.name === ref.name) ??
      -1;
    return idx >= 0 ? { ...ref, index: idx } : ref;
  };

  return {
    ...player,
    equippedSlots: {
      mainHand: withIndex(slots.mainHand),
      offHand: withIndex(slots.offHand),
      armor: withIndex(slots.armor),
      accessory: withIndex(slots.accessory),
    },
  };
}

/**
 * Restore the isEquipped convenience flags on inventory items from equippedSlots.
 * These are stripped before saving and must be re-added so that runtime code
 * that still reads item.isEquipped directly continues to work.
 */
function restoreRuntimeEquippedFlags(player: TypePlayer): TypePlayer {
  return rehydrateIsEquipped(player);
}

/**
 * Ensures all required properties for TypePlayer are present.
 * Guarantees player.info and player.info.bonds are always defined post-load.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRequiredFields(player: Record<string, any>): TypePlayer {
  const info = player.info ?? {};
  return {
    ...player,
    info: {
      ...info,
      bonds: Array.isArray(info.bonds) ? info.bonds : [],
    },
    rituals: player.rituals ?? {
      ritualism: false,
      arcanism: false,
      chimerism: false,
      elementalism: false,
      entropism: false,
      spiritism: false,
    },
    martials: player.martials ?? {
      armor: false,
      shields: false,
      melee: false,
      ranged: false,
    },
    items: player.items ?? [],
    consumables: player.consumables ?? [],
    affinities: player.affinities ?? {},
    modifiers: player.modifiers ?? {
      hp: 0,
      mp: 0,
      ip: 0,
      def: 0,
      mdef: 0,
      init: 0,
      meleePrec: 0,
      rangedPrec: 0,
      magicPrec: 0,
    },
    statuses: player.statuses ?? {
      slow: false,
      dazed: false,
      enraged: false,
      weak: false,
      shaken: false,
      poisoned: false,
      dexUp: false,
      insUp: false,
      migUp: false,
      wlpUp: false,
    },
    immunities: player.immunities ?? {
      slow: false,
      dazed: false,
      enraged: false,
      weak: false,
      shaken: false,
      poisoned: false,
    },
  } as TypePlayer;
}

/**
 * Normalizes armor/shield items where def/mdef were stored as 0 but the
 * original compendium data (preserved in base) has defbonus/mdefbonus values.
 * This fixes items imported before the import normalization was in place.
 */
function normalizeArmorDefValues(player: TypePlayer): TypePlayer {
  const inv = player.equipment?.[0];
  if (!inv) return player;

  let changed = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fix = (arr: Array<Record<string, any>>) =>
    arr.map((item: Record<string, any>) => {
      const patch: Record<string, unknown> = {};
      if (!item.def) {
        const v = (item.base?.def ?? 0) + (item.base?.defbonus ?? 0);
        if (v) patch.def = v;
      }
      if (!item.mdef) {
        const v = (item.base?.mdef ?? 0) + (item.base?.mdefbonus ?? 0);
        if (v) patch.mdef = v;
      }
      if (Object.keys(patch).length) {
        changed = true;
        return { ...item, ...patch };
      }
      return item;
    });

  const fixedArmor = fix(inv.armor ?? []);
  const fixedShields = fix(inv.shields ?? []);

  if (!changed) return player;

  return {
    ...player,
    equipment: [
      { ...inv, armor: fixedArmor, shields: fixedShields },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

const POST_LOAD_TRANSFORMS: PlayerTransform[] = [
  normalizeRequiredFields,
  migrateLegacyEquipment,
  normalizeSkillLevels,
  normalizeNotes,
  normalizeArmorDefValues,
  migrateEquippedSlots,
  migrateSlotIndexes,
  restoreRuntimeEquippedFlags,
];

/** Run all post-load transforms and return the player ready for in-memory use. */
export function applyPostLoadTransforms(player: TypePlayer): TypePlayer {
  return POST_LOAD_TRANSFORMS.reduce((p, fn) => fn(p), player);
}

// Migration detection

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
  // Root-level equipment arrays need nesting into equipment[0]
  const legacySources = [
    "weapons",
    "shields",
    "armor",
    "accessories",
    "customWeapons",
  ] as const;

  if (
    legacySources.some((k) => Array.isArray((player as Record<string, any>)[k]))
  )
    return true;

  // Any skill still using deprecated currentSL

  if (
    (player as Record<string, any>).classes?.some((cls: Record<string, any>) =>
      cls.skills?.some(
        (sk: Record<string, unknown>) =>
          "currentSL" in sk && sk.currentSL !== undefined,
      ),
    )
  )
    return true;

  const inv = player.equipment?.[0];

  if (!player.equippedSlots) {
    // Only a legacy player if equipment[0] exists — new players have no equipment[0]
    // yet and will get equippedSlots derived on first open/save normally.
    return !!inv;
  }

  // Has equippedSlots but isEquipped flags weren't stripped before the last save.
  if (!inv) return false;
  return legacySources.some((k) =>
    ((inv as Record<string, unknown>)[k] ?? []).some(
      (item: Record<string, unknown>) => "isEquipped" in item,
    ),
  );
}
