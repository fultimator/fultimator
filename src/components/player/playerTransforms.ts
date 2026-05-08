import { TypePlayer, SlotRef } from "../../types/Players";
import {
  syncSlots,
  validateSlots,
  rehydrateIsEquipped,
} from "./equipment/slots/equipmentSlots";
import { syncAutomaticClassLevels } from "./classes/classLevelUtils";

type PlayerTransform = (player: TypePlayer) => TypePlayer;

interface VersionedTransform {
  version: number;
  label: string;
  fn: PlayerTransform;
}

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
  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons: (inv.weapons ?? []).map(
          ({ isEquipped: _e, ...rest }) => rest,
        ) as typeof inv.weapons,
        shields: (inv.shields ?? []).map(
          ({ isEquipped: _e, ...rest }) => rest,
        ) as typeof inv.shields,
        armor: (inv.armor ?? []).map(
          ({ isEquipped: _e, ...rest }) => rest,
        ) as typeof inv.armor,
        accessories: (inv.accessories ?? []).map(
          ({ isEquipped: _e, ...rest }) => rest,
        ) as typeof inv.accessories,
        customWeapons: (inv.customWeapons ?? []).map(
          ({ isEquipped: _e, ...rest }) => rest,
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
  const settings = player.settings ?? {};
  const rawOptionalRules = settings.optionalRules ?? {};
  const optionalRules = {
    quirks: rawOptionalRules.quirks ?? false,
    campActivities: rawOptionalRules.campActivities ?? false,
    zeroPower: rawOptionalRules.zeroPower ?? false,
    technospheres: rawOptionalRules.technospheres ?? false,
    technospheresVariant: rawOptionalRules.technospheresVariant ?? "standard",
    innateClasses: rawOptionalRules.innateClasses ?? [],
  };

  const rawOverrides = settings.specialSkillOverrides ?? {};
  const specialSkillOverrides = Object.fromEntries(
    Object.entries(rawOverrides).filter(([, value]) => value === true),
  );

  const nextSettings: typeof settings = {
    ...settings,
    defaultView: settings.defaultView === "compact" ? "compact" : "normal",
    automaticClassLevel: rawOptionalRules.technospheres
      ? true
      : (settings.automaticClassLevel ?? true),
    advancement: settings.advancement ?? false,
    optionalRules,
    specialSkillOverrides:
      Object.keys(specialSkillOverrides).length > 0
        ? (specialSkillOverrides as Record<string, true>)
        : undefined,
  };

  return {
    ...player,
    settings: nextSettings,
  } as TypePlayer;
}

const PRE_SAVE_TRANSFORMS: PlayerTransform[] = [
  syncAutomaticClassLevels,
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
// Each versioned transform bumps schemaVersion to its declared version when applied.

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
function migrateLegacyEquipment(player: TypePlayer): TypePlayer {
  const legacySources = [
    "weapons",
    "shields",
    "armor",
    "accessories",
    "customWeapons",
  ] as const;
  const raw = player as unknown as Record<string, unknown>;
  const hasLegacyData = legacySources.some((key) => Array.isArray(raw[key]));

  if (!hasLegacyData) return player;

  const equipment = raw.equipment as unknown[] | undefined;
  const eq0: Record<string, unknown> = {
    ...((equipment?.[0] as Record<string, unknown>) ?? {}),
  };

  legacySources.forEach((key) => {
    if (Array.isArray(raw[key])) {
      eq0[key] = [
        ...((eq0[key] as unknown[]) ?? []),
        ...(raw[key] as unknown[]),
      ];
      delete raw[key];
    }
  });

  return {
    ...raw,
    equipment: [eq0, ...(equipment?.slice(1) ?? [])],
  } as unknown as TypePlayer;
}

/**
 * Ensures all skills use 'currentLvl' instead of the deprecated 'currentSL'.
 */
function normalizeSkillLevels(player: TypePlayer): TypePlayer {
  if (!player.classes) return player;
  const updatedClasses = player.classes.map((cls) => ({
    ...cls,
    skills:
      cls.skills?.map((sk) => {
        const raw = sk as unknown as Record<string, unknown>;
        if ("currentSL" in raw && raw.currentSL !== undefined) {
          const { currentSL, ...rest } = raw;
          return { ...rest, currentLvl: currentSL } as typeof sk;
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
 * Safe to run on every load; no-ops when index is already present.
 */
function migrateSlotIndexes(player: TypePlayer): TypePlayer {
  const slots = player.equippedSlots;
  if (!slots) return player;

  const inv = player.equipment?.[0];

  const withIndex = (
    ref: SlotRef | null | undefined,
  ): SlotRef | null | undefined => {
    if (!ref || ref.index !== undefined) return ref;
    const arr = inv?.[ref.source] as Array<{ name: string }> | undefined;
    const idx = arr?.findIndex((it) => it.name === ref.name) ?? -1;
    return idx >= 0 ? { ...ref, index: idx } : ref;
  };

  const updated: NonNullable<TypePlayer["equippedSlots"]> = {};
  if (slots.mainHand !== undefined)
    updated.mainHand = withIndex(slots.mainHand);
  if (slots.offHand !== undefined) updated.offHand = withIndex(slots.offHand);
  if (slots.armor !== undefined) updated.armor = withIndex(slots.armor);
  if (slots.accessory !== undefined)
    updated.accessory = withIndex(slots.accessory);

  return {
    ...player,
    equippedSlots: updated,
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
 * Drops any IDs in customWeapon/armor slotted[] arrays that no longer exist in
 * the sphere banks. Prevents dangling refs after a sphere is deleted.
 */
function pruneStaleSlotRefs(player: TypePlayer): TypePlayer {
  const eq0 = player.equipment?.[0];
  if (!eq0) return player;

  const validIds = new Set([
    ...(eq0.mnemospheres ?? []).map((m) => m.id),
    ...(eq0.hoplospheres ?? []).map((h) => h.id),
  ]);

  let changed = false;

  const customWeapons = (eq0.customWeapons ?? []).map((w) => {
    if (!w.slotted?.length) return w;
    const pruned = w.slotted.filter((id) => validIds.has(id));
    if (pruned.length === w.slotted.length) return w;
    changed = true;
    return { ...w, slotted: pruned };
  });

  const armor = (eq0.armor ?? []).map((a) => {
    if (!a.slotted?.length) return a;
    const pruned = a.slotted.filter((id) => validIds.has(id));
    if (pruned.length === a.slotted.length) return a;
    changed = true;
    return { ...a, slotted: pruned };
  });

  const mnemoReceptacle = (eq0.mnemoReceptacle ?? []).filter((id) =>
    validIds.has(id),
  );
  if (mnemoReceptacle.length !== (eq0.mnemoReceptacle ?? []).length)
    changed = true;

  if (!changed) return player;

  return {
    ...player,
    equipment: [
      {
        ...eq0,
        customWeapons,
        armor,
        ...(eq0.mnemoReceptacle !== undefined ? { mnemoReceptacle } : {}),
      },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

/**
 * Ensures all required properties for TypePlayer are present.
 * Guarantees player.info and player.info.bonds are always defined post-load.
 */
function normalizeRequiredFields(player: TypePlayer): TypePlayer {
  const info = player.info ?? ({} as typeof player.info);
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
    equipment: (() => {
      const isTechnospheres =
        player.settings?.optionalRules?.technospheres ?? false;
      const eq0 = player.equipment?.[0];
      if (!eq0) {
        // Technospheres players must always have equipment[0] with sphere arrays.
        // Non-technospheres players with no equipment array stay as-is.
        if (!isTechnospheres) return player.equipment;
        return [{ mnemospheres: [], hoplospheres: [] }];
      }
      const isIntegrated =
        player.settings?.optionalRules?.technospheresVariant === "integrated";
      const needsPatch =
        !Array.isArray(eq0.mnemospheres) ||
        !Array.isArray(eq0.hoplospheres) ||
        (isIntegrated && !Array.isArray(eq0.mnemoReceptacle));
      if (!needsPatch) return player.equipment;
      return [
        {
          ...eq0,
          mnemospheres: Array.isArray(eq0.mnemospheres) ? eq0.mnemospheres : [],
          hoplospheres: Array.isArray(eq0.hoplospheres) ? eq0.hoplospheres : [],
          ...(isIntegrated && !Array.isArray(eq0.mnemoReceptacle)
            ? { mnemoReceptacle: [] }
            : {}),
        },
        ...(player.equipment?.slice(1) ?? []),
      ];
    })(),
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
  // `base` is a legacy snapshot field not in the Armor/Shields types yet; cast needed.
  type ItemWithBase = {
    def?: number;
    mdef?: number;
    base?: {
      def?: number;
      defbonus?: number;
      mdef?: number;
      mdefbonus?: number;
    };
  };
  const fix = (arr: ItemWithBase[]) =>
    arr.map((item) => {
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
      {
        ...inv,
        armor: fixedArmor as unknown as typeof inv.armor,
        shields: fixedShields as unknown as typeof inv.shields,
      },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

// One-time versioned migrations.
// Each transform brings the player up to its declared schema version.
// Skipped if schemaVersion is already >= the transform's version.
// Transforms must be ordered by ascending version.
const POST_LOAD_TRANSFORMS: VersionedTransform[] = [
  {
    version: 1,
    label: "Fill in missing default fields (stats, rituals, martials, items…)",
    fn: normalizeRequiredFields,
  },
  {
    version: 2,
    label: "Move equipment from old root-level arrays into the inventory",
    fn: migrateLegacyEquipment,
  },
  {
    version: 3,
    label: "Rename skill field currentSL to currentLvl",
    fn: normalizeSkillLevels,
  },
  {
    version: 4,
    label: "Convert legacy string notes to structured note objects",
    fn: normalizeNotes,
  },
  {
    version: 5,
    label: "Fix armor and shield defense values that were saved as zero",
    fn: normalizeArmorDefValues,
  },
  {
    version: 6,
    label: "Build equipment slot map from legacy isEquipped item flags",
    fn: migrateEquippedSlots,
  },
];

export const PLAYER_CURRENT_SCHEMA_VERSION =
  POST_LOAD_TRANSFORMS[POST_LOAD_TRANSFORMS.length - 1].version;

// Always-run transforms.
// Applied on every load regardless of schemaVersion; these guard runtime
// integrity rather than perform one-time shape changes.
const ALWAYS_RUN_TRANSFORMS: PlayerTransform[] = [
  syncAutomaticClassLevels, // class lvl must stay in sync with skill totals
  migrateSlotIndexes, // new items may be saved without an index
  restoreRuntimeEquippedFlags, // isEquipped is stripped on save, must be rehydrated
  pruneStaleSlotRefs, // spheres may be deleted between loads
];

/** Run all post-load transforms and return the player ready for in-memory use. */
export function applyPostLoadTransforms(player: TypePlayer): TypePlayer {
  let result = POST_LOAD_TRANSFORMS.reduce((p, t) => {
    if (p.schemaVersion !== undefined && p.schemaVersion >= t.version) return p;
    return { ...t.fn(p), schemaVersion: t.version };
  }, player);
  // Stamp version even if all migrations were already applied.
  if ((result.schemaVersion ?? 0) < PLAYER_CURRENT_SCHEMA_VERSION) {
    result = { ...result, schemaVersion: PLAYER_CURRENT_SCHEMA_VERSION };
  }
  // Always-run transforms execute after versioned migrations, every load.
  return ALWAYS_RUN_TRANSFORMS.reduce((p, fn) => fn(p), result);
}

// Migration detection

/** Returns the labels of transforms that would be applied to this player. */
export function getPendingPlayerMigrations(player: TypePlayer): string[] {
  const current = player.schemaVersion ?? 0;
  return POST_LOAD_TRANSFORMS.filter((t) => t.version > current).map(
    (t) => t.label,
  );
}

/**
 * Returns true if the player would be changed by applyPostLoadTransforms.
 */
export function playerNeedsMigration(player: TypePlayer): boolean {
  return (player.schemaVersion ?? 0) < PLAYER_CURRENT_SCHEMA_VERSION;
}
