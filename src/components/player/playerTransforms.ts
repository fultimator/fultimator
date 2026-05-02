import { TypePlayer, SlotRef } from "../../types/Players";
import {
  syncSlots,
  validateSlots,
  rehydrateIsEquipped,
} from "./equipment/slots/equipmentSlots";
import { syncAutomaticClassLevels } from "./classes/classLevelUtils";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    arr.map(({ isEquipped, ...rest }) => rest);
  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons: strip(inv.weapons ?? []) as unknown as typeof inv.weapons,
        shields: strip(inv.shields ?? []) as unknown as typeof inv.shields,
        armor: strip(inv.armor ?? []) as unknown as typeof inv.armor,
        accessories: strip(
          inv.accessories ?? [],
        ) as unknown as typeof inv.accessories,
        customWeapons: strip(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (inv.customWeapons ?? []) as Array<Record<string, any>>,
        ) as unknown as typeof inv.customWeapons,
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
    technospheresVariant: rawOptionalRules.technospheresVariant ?? "standard",
    innateClasses: rawOptionalRules.innateClasses ?? [],
  };

  const rawOverrides = settings.specialSkillOverrides ?? {};
  const specialSkillOverrides = Object.fromEntries(
    Object.entries(rawOverrides).filter(([, value]) => value === true),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextSettings: Record<string, any> = {
    ...settings,
    defaultView: settings.defaultView === "compact" ? "compact" : "normal",
    automaticClassLevel: rawOptionalRules.technospheres
      ? true
      : (settings.automaticClassLevel ?? true),
    advancement: settings.advancement ?? rawOptionalRules.advancement ?? false,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = player as Record<string, any>;
  const hasLegacyData = legacySources.some((key) => Array.isArray(raw[key]));

  if (!hasLegacyData) return player;

  const eq0: Record<string, unknown> = {
    ...(raw.equipment?.[0] ?? {}),
  };

  legacySources.forEach((key) => {
    if (Array.isArray(raw[key])) {
      eq0[key] = [...((eq0[key] as unknown[]) ?? []), ...raw[key]];
      delete raw[key];
    }
  });

  return {
    ...raw,
    equipment: [eq0, ...(raw.equipment?.slice(1) ?? [])],
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
      cls.skills?.map((sk) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = sk as Record<string, any>;
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
 * Safe to run on every load — no-ops when index is already present.
 */
function migrateSlotIndexes(player: TypePlayer): TypePlayer {
  const slots = player.equippedSlots;
  if (!slots) return player;

  const inv = player.equipment?.[0];

  const withIndex = (
    ref: SlotRef | null | undefined,
  ): SlotRef | null | undefined => {
    if (!ref || ref.index !== undefined) return ref;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (inv as Record<string, any> | undefined)?.[ref.source] as
      | Array<{ name: string }>
      | undefined;
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

  if (!changed) return player;

  return {
    ...player,
    equipment: [
      { ...eq0, customWeapons, armor },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

/**
 * Ensures all required properties for TypePlayer are present.
 * Guarantees player.info and player.info.bonds are always defined post-load.
 */
function normalizeRequiredFields(player: TypePlayer): TypePlayer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const info: Record<string, any> = player.info ?? {};
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
        (player.settings as any)?.optionalRules?.technospheres ?? false;
      const eq0 = player.equipment?.[0];
      if (!eq0) {
        // Technospheres players must always have equipment[0] with sphere arrays.
        // Non-technospheres players with no equipment array stay as-is.
        if (!isTechnospheres) return player.equipment;
        return [{ mnemospheres: [], hoplospheres: [] }];
      }
      const needsPatch =
        !Array.isArray(eq0.mnemospheres) || !Array.isArray(eq0.hoplospheres);
      if (!needsPatch) return player.equipment;
      return [
        {
          ...eq0,
          mnemospheres: Array.isArray(eq0.mnemospheres) ? eq0.mnemospheres : [],
          hoplospheres: Array.isArray(eq0.hoplospheres) ? eq0.hoplospheres : [],
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fix = (arr: Array<Record<string, any>>) =>
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

const POST_LOAD_TRANSFORMS: PlayerTransform[] = [
  normalizeRequiredFields,
  migrateLegacyEquipment,
  normalizeSkillLevels,
  syncAutomaticClassLevels,
  normalizeNotes,
  normalizeArmorDefValues,
  migrateEquippedSlots,
  migrateSlotIndexes,
  restoreRuntimeEquippedFlags,
  pruneStaleSlotRefs,
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
    legacySources.some((k) =>
      Array.isArray((player as unknown as Record<string, unknown>)[k]),
    )
  )
    return true;

  // Any skill still using deprecated currentSL

  if (
    player.classes?.some((cls) =>
      cls.skills?.some(
        (sk) =>
          "currentSL" in sk &&
          (sk as Record<string, unknown>).currentSL !== undefined,
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
    ((inv as unknown as Record<string, unknown[]>)[k] ?? []).some(
      (item: unknown) =>
        typeof item === "object" && item !== null && "isEquipped" in item,
    ),
  );
}
