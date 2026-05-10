import { TypePlayer, SlotRef } from "../../types/Players";
import {
  syncSlots,
  validateSlots,
  rehydrateIsEquipped,
} from "./equipment/slots/equipmentSlots";
import { syncAutomaticClassLevels } from "./classes/classLevelUtils";
import {
  normalizeWeaponLike,
  normalizeCustomWeaponLike,
} from "../../libs/weaponNormalization";

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

/**
 * Ensures persisted weapon arrays are canonical v8 shape.
 * Legacy fields may exist in runtime state while UI transitions are in progress.
 */
function normalizeWeaponSchemasForSave(player: TypePlayer): TypePlayer {
  const inv = player.equipment?.[0];
  if (!inv) return player;
  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons: (inv.weapons ?? []).map((w) =>
          normalizeWeaponLike(w as unknown as Record<string, unknown>),
        ) as typeof inv.weapons,
        customWeapons: (inv.customWeapons ?? []).map((w) =>
          normalizeCustomWeaponLike(w as unknown as Record<string, unknown>),
        ) as typeof inv.customWeapons,
      },
      ...(player.equipment?.slice(1) ?? []),
    ],
  };
}

const PRE_SAVE_TRANSFORMS: PlayerTransform[] = [
  syncAutomaticClassLevels,
  normalizeSettingsForSave,
  normalizeWeaponSchemasForSave,
  stripRuntimeEquippedFlags,
];

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefinedDeep(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefinedDeep(v);
    }
    return out as T;
  }
  return value;
}

/** Run all pre-save transforms and return the player ready to write to the DB. */
export function applyPreSaveTransforms(player: TypePlayer): TypePlayer {
  const transformed = PRE_SAVE_TRANSFORMS.reduce((p, fn) => fn(p), player);
  return stripUndefinedDeep(transformed);
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

// Weapon schema helpers

const CATEGORY_DEFENSE: Record<string, "def" | "mdef"> = {};
// All standard weapon categories target DEF; none currently target MDEF.
// Kept as a lookup so future categories can opt in without changing call sites.
function categoryDefense(_category: string): "def" | "mdef" {
  return CATEGORY_DEFENSE[_category] ?? "def";
}

function normalizeWeaponCategory(category: string | undefined): string {
  return category === "spear_category" ? "Spear" : (category ?? "");
}

function resolveCustomDamageType(
  customizations: { name: string }[],
  overrideDamageType: boolean | undefined,
  customDamageType: string | undefined,
  fallbackType: string | undefined,
): string {
  const hasElemental = customizations.some(
    (c) => c.name === "weapon_customization_elemental",
  );
  if (hasElemental) return customDamageType ?? fallbackType ?? "physical";
  if (overrideDamageType && customDamageType) return customDamageType;
  return fallbackType ?? "physical";
}

function calcCustomWeaponDamage(
  customizations: { name: string }[],
  category: string,
  rareAccuracyBonus: boolean,
  rareDamageBonus: boolean,
  damageModifier: number,
  precModifier: number,
): { damage: number; precision: number } {
  let damage = 5;
  let precision = 0;
  for (const c of customizations) {
    switch (c.name) {
      case "weapon_customization_accurate":
        precision += 2;
        break;
      case "weapon_customization_powerful":
        damage += category === "weapon_category_heavy" ? 7 : 5;
        break;
      case "weapon_customization_elemental":
        damage += 2;
        break;
    }
  }
  if (rareAccuracyBonus) precision += 1;
  if (rareDamageBonus) damage += 4;
  damage += damageModifier;
  precision += precModifier;
  return { damage, precision };
}

const DAMAGE_SPELL_TYPES = new Set(["default", "arcanist", "arcanist-rework"]);

function unifyPlayerSpellSchema(player: TypePlayer): TypePlayer {
  const migrateSpell = <T extends object>(spell: T): T => {
    const s = { ...spell } as Record<string, unknown>;
    if (s.cost === undefined) {
      let amount = 0;
      if (s.mp !== undefined) {
        amount =
          typeof s.mp === "number" ? s.mp : parseInt(String(s.mp), 10) || 0;
      }
      s.cost = { resource: "mp", amount, perTarget: true };
    }
    delete s.mp;
    if (s.targetDescription === undefined) {
      s.targetDescription = (s.targetDesc as string) ?? "";
      delete s.targetDesc;
    }
    if (s.range === undefined) s.range = "ranged";
    if (s.description === undefined) s.description = "";
    if (s.itemType === undefined) s.itemType = "spell";
    if (s.special === undefined) s.special = [];
    if (
      s.damage === undefined &&
      DAMAGE_SPELL_TYPES.has(s.spellType as string)
    ) {
      s.damage = { value: 0, type: "physical" };
    }

    // attr1 + attr2 -> accuracy object
    if (s.accuracy === undefined) {
      s.accuracy = {
        attr1: (s.attr1 as string) ?? "insight",
        attr2: (s.attr2 as string) ?? "will",
        value: 0,
        defense: "mdef",
      };
    }
    delete s.attr1;
    delete s.attr2;

    return s as T;
  };

  return {
    ...player,
    classes: player.classes?.map((cls) => ({
      ...cls,
      spells: cls.spells?.map(migrateSpell) ?? [],
    })),
    equipment: player.equipment?.map((eq) => ({
      ...eq,
      mnemospheres: eq.mnemospheres?.map((m) => ({
        ...m,
        spells: m.spells?.map(migrateSpell) ?? [],
      })),
    })),
  };
}

function unifyPlayerWeaponSchema(player: TypePlayer): TypePlayer {
  const inv = player.equipment?.[0];
  if (!inv) return player;

  type RawWeapon = Record<string, unknown>;

  const migrateWeapon = (w: RawWeapon): RawWeapon => {
    if (
      w.accuracy !== undefined &&
      w.damage !== undefined &&
      typeof w.damage === "object"
    ) {
      return {
        ...w,
        category: normalizeWeaponCategory(w.category as string | undefined),
      };
    }
    const attr1 = (w.attr1 as string) ?? "dexterity";
    const attr2 = (w.attr2 as string) ?? "might";
    const prec = typeof w.prec === "number" ? w.prec : 0;
    const dmg = typeof w.dmg === "number" ? w.dmg : 0;
    const range: "melee" | "ranged" = w.isRanged ? "ranged" : "melee";
    const next: RawWeapon = { ...w };
    next.category = normalizeWeaponCategory(w.category as string | undefined);
    next.accuracy = { attr1, attr2, value: prec, defense: "def" };
    next.damage = { value: dmg, type: "physical" };
    next.range = range;
    next.martial = w.isMartial ?? w.martial ?? false;
    delete next.attr1;
    delete next.attr2;
    delete next.prec;
    delete next.dmg;
    delete next.isRanged;
    delete next.isMartial;
    delete next.isEquipped;
    delete next.isExtraPrec;
    delete next.isExtraDmg;
    return next;
  };

  const migrateCustomWeapon = (w: RawWeapon): RawWeapon => {
    if (
      w.accuracy !== undefined &&
      w.damage !== undefined &&
      typeof w.damage === "object"
    ) {
      const rare = (w.rare as Record<string, unknown> | undefined) ?? {};
      const modifiers =
        (w.modifiers as Record<string, unknown> | undefined) ?? {};
      const secondModifiers =
        (w.secondModifiers as Record<string, unknown> | undefined) ?? {};
      return {
        ...w,
        category: normalizeWeaponCategory(w.category as string | undefined),
        range:
          w.range === "ranged" || w.range === "distance" ? "ranged" : "melee",
        hands:
          w.hands === 2 || w.hands === 1
            ? (w.hands as 1 | 2)
            : w.isTwoHand
              ? 2
              : 2,
        martial: (w.martial as boolean | undefined) ?? false,
        modifiers: {
          damage:
            (modifiers.damage as number | undefined) ??
            (typeof w.damageModifier === "number" ? w.damageModifier : 0),
          accuracy:
            (modifiers.accuracy as number | undefined) ??
            (typeof w.precModifier === "number" ? w.precModifier : 0),
          def:
            (modifiers.def as number | undefined) ??
            (typeof w.defModifier === "number" ? w.defModifier : 0),
          mdef:
            (modifiers.mdef as number | undefined) ??
            (typeof w.mDefModifier === "number" ? w.mDefModifier : 0),
        },
        secondModifiers: {
          damage:
            (secondModifiers.damage as number | undefined) ??
            (typeof w.secondDamageModifier === "number"
              ? w.secondDamageModifier
              : 0),
          accuracy:
            (secondModifiers.accuracy as number | undefined) ??
            (typeof w.secondPrecModifier === "number"
              ? w.secondPrecModifier
              : 0),
          def:
            (secondModifiers.def as number | undefined) ??
            (typeof w.secondDefModifier === "number" ? w.secondDefModifier : 0),
          mdef:
            (secondModifiers.mdef as number | undefined) ??
            (typeof w.secondMDefModifier === "number"
              ? w.secondMDefModifier
              : 0),
        },
        rare: {
          accuracyBonus:
            (rare.accuracyBonus as boolean | undefined) ??
            !!w.rareAccuracyBonus,
          damageBonus:
            (rare.damageBonus as boolean | undefined) ?? !!w.rareDamageBonus,
          overrideDamageType:
            (rare.overrideDamageType as boolean | undefined) ??
            !!w.overrideDamageType,
          overrideAccuracyAttributes:
            (rare.overrideAccuracyAttributes as boolean | undefined) ??
            !!w.overrideAccuracyAttributes,
          overrideDamageTypeValue:
            (rare.overrideDamageTypeValue as string | undefined) ??
            (w.customDamageType as string | undefined),
          overrideAccuracyAttr1:
            (rare.overrideAccuracyAttr1 as string | undefined) ??
            ((w.accuracy as Record<string, unknown> | undefined)?.attr1 as
              | string
              | undefined),
          overrideAccuracyAttr2:
            (rare.overrideAccuracyAttr2 as string | undefined) ??
            ((w.accuracy as Record<string, unknown> | undefined)?.attr2 as
              | string
              | undefined),
        },
        ...(w.secondSelectedCategory
          ? {
              secondSelectedCategory: normalizeWeaponCategory(
                w.secondSelectedCategory as string | undefined,
              ),
            }
          : {}),
        ...(w.secondSelectedRange
          ? {
              secondSelectedRange:
                w.secondSelectedRange === "ranged" ||
                w.secondSelectedRange === "distance"
                  ? "ranged"
                  : "melee",
            }
          : {}),
        ...(w.secondCurrentCustomizations !== undefined &&
        w.secondCustomizations === undefined
          ? { secondCustomizations: w.secondCurrentCustomizations }
          : {}),
      };
    }

    const ac = w.accuracyCheck as RawWeapon | undefined;
    const attr1 = (ac?.att1 as string) ?? (w.attr1 as string) ?? "dexterity";
    const attr2 = (ac?.att2 as string) ?? (w.attr2 as string) ?? "might";
    const precModifier =
      typeof w.precModifier === "number" ? w.precModifier : 0;
    const damageModifier =
      typeof w.damageModifier === "number" ? w.damageModifier : 0;
    const customizations = (w.customizations as { name: string }[]) ?? [];
    const category = normalizeWeaponCategory(w.category as string | undefined);

    const { damage, precision } = calcCustomWeaponDamage(
      customizations,
      category,
      !!w.rareAccuracyBonus,
      !!w.rareDamageBonus,
      damageModifier,
      precModifier,
    );
    const damageType = resolveCustomDamageType(
      customizations,
      w.overrideDamageType as boolean | undefined,
      w.customDamageType as string | undefined,
      w.type as string | undefined,
    );

    const next: RawWeapon = { ...w };
    next.category = category;
    next.hands = w.hands === 2 || w.hands === 1 ? w.hands : 2;
    next.martial = (w.martial as boolean | undefined) ?? false;
    next.accuracy = {
      attr1,
      attr2,
      value: precision,
      defense: categoryDefense(category),
    };
    next.damage = { value: damage, type: damageType };
    next.modifiers = {
      damage: damageModifier,
      accuracy: precModifier,
      def: typeof w.defModifier === "number" ? w.defModifier : 0,
      mdef: typeof w.mDefModifier === "number" ? w.mDefModifier : 0,
    };
    next.rare = {
      accuracyBonus: !!w.rareAccuracyBonus,
      damageBonus: !!w.rareDamageBonus,
      overrideDamageType: !!w.overrideDamageType,
      overrideAccuracyAttributes: !!w.overrideAccuracyAttributes,
      overrideDamageTypeValue:
        (w.customDamageType as string | undefined) ??
        (w.type as string | undefined) ??
        "physical",
      overrideAccuracyAttr1: attr1,
      overrideAccuracyAttr2: attr2,
    };
    delete next.accuracyCheck;
    delete next.precModifier;
    delete next.damageModifier;
    delete next.customDamageType;
    delete next.type;
    delete next.isEquipped;

    // Secondary form
    const secondAc = w.secondSelectedAccuracyCheck as RawWeapon | undefined;
    const hasSecond = !!w.secondWeaponName || !!secondAc;
    if (hasSecond) {
      const s2attr1 = (secondAc?.att1 as string) ?? attr1;
      const s2attr2 = (secondAc?.att2 as string) ?? attr2;
      const s2precModifier =
        typeof w.secondPrecModifier === "number" ? w.secondPrecModifier : 0;
      const s2damageModifier =
        typeof w.secondDamageModifier === "number" ? w.secondDamageModifier : 0;
      const s2customizations =
        (w.secondCurrentCustomizations as { name: string }[]) ?? [];
      const s2category = normalizeWeaponCategory(
        (w.secondSelectedCategory as string | undefined) ?? category,
      );
      const { damage: s2damage, precision: s2precision } =
        calcCustomWeaponDamage(
          s2customizations,
          s2category,
          !!w.rareAccuracyBonus,
          !!w.rareDamageBonus,
          s2damageModifier,
          s2precModifier,
        );
      const s2damageType = resolveCustomDamageType(
        s2customizations,
        w.secondOverrideDamageType as boolean | undefined,
        (w.secondCustomDamageType as string | undefined) ??
          (w.customDamageType as string | undefined),
        (w.secondSelectedType as string | undefined) ??
          (w.type as string | undefined),
      );
      next.secondAccuracy = {
        attr1: s2attr1,
        attr2: s2attr2,
        value: s2precision,
        defense: categoryDefense(s2category),
      };
      next.secondDamage = { value: s2damage, type: s2damageType };
      next.secondModifiers = {
        damage: s2damageModifier,
        accuracy: s2precModifier,
        def: typeof w.secondDefModifier === "number" ? w.secondDefModifier : 0,
        mdef:
          typeof w.secondMDefModifier === "number" ? w.secondMDefModifier : 0,
      };
      next.secondSelectedCategory = s2category;
    }
    delete next.secondPrecModifier;
    delete next.secondDamageModifier;
    delete next.secondDefModifier;
    delete next.secondMDefModifier;
    delete next.secondSelectedAccuracyCheck;
    delete next.secondCustomDamageType;
    delete next.secondSelectedType;
    delete next.secondOverrideDamageType;
    delete next.overrideDamageType;
    delete next.overrideAccuracyAttributes;
    delete next.rareAccuracyBonus;
    delete next.rareDamageBonus;
    delete next.damageModifier;
    delete next.precModifier;
    delete next.defModifier;
    delete next.mDefModifier;
    if (
      next.secondCurrentCustomizations !== undefined &&
      next.secondCustomizations === undefined
    ) {
      next.secondCustomizations = next.secondCurrentCustomizations;
    }
    delete next.secondCurrentCustomizations;

    return next;
  };

  return {
    ...player,
    equipment: [
      {
        ...inv,
        weapons: (inv.weapons ?? []).map((w) =>
          migrateWeapon(w as unknown as RawWeapon),
        ) as unknown as typeof inv.weapons,
        customWeapons: (inv.customWeapons ?? []).map((w) =>
          migrateCustomWeapon(w as unknown as RawWeapon),
        ) as unknown as typeof inv.customWeapons,
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
  {
    version: 7,
    label:
      "Unify spell schema: damage object, range, description, itemType; rename mp->cost, targetDesc->targetDescription",
    fn: unifyPlayerSpellSchema,
  },
  {
    version: 8,
    label:
      "Unify weapon schema: accuracy/damage objects, flatten attr1/attr2, resolve damage type and final values",
    fn: unifyPlayerWeaponSchema,
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
