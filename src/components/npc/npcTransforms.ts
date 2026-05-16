import {
  TypeNpc,
  NpcAttributes,
  NpcResources,
  NpcDerived,
  NpcFeatures,
} from "../../types/Npcs";
import { Affinities, Elements } from "../../types/Misc";
import { normalizeDefensiveItem } from "../../libs/equipmentDefensiveNormalization";
import { calcHP, calcMP } from "../../libs/npcs";

type NpcTransform = (npc: TypeNpc) => TypeNpc;

interface VersionedTransform {
  version: number;
  label: string;
  fn: NpcTransform;
}

function normalizeElementType(type: unknown): Elements {
  const raw = String(type ?? "physical")
    .toLowerCase()
    .trim();
  if (raw === "air") return "air" as Elements;
  return (raw || "physical") as Elements;
}

// Pre-save transforms
const PRE_SAVE_TRANSFORMS: NpcTransform[] = [
  // No transforms yet - placeholder for future cleanup passes.
];

export function applyNpcPreSaveTransforms(npc: TypeNpc): TypeNpc {
  return PRE_SAVE_TRANSFORMS.reduce((n, fn) => fn(n), npc);
}

// Post-load transforms
// Each versioned transform brings the NPC up to its declared schema version.
// Add new transforms here as the schema evolves; order by ascending version.

function fixSheildTypo(npc: TypeNpc): TypeNpc {
  const raw = npc as TypeNpc & { sheild?: TypeNpc["shield"] };
  if (!("sheild" in raw)) return npc;
  const { sheild, ...rest } = raw;
  return sheild !== undefined ? { ...rest, shield: sheild } : rest;
}

function addMissingFireAffinity(npc: TypeNpc): TypeNpc {
  if (npc.affinities?.fire !== undefined) return npc;
  return {
    ...npc,
    affinities: { ...npc.affinities, fire: Affinities.None },
  };
}

function normalizeArmorAndShieldFields(npc: TypeNpc): TypeNpc {
  const normalizeArmor = (armor: TypeNpc["armor"]) => {
    if (!armor) return armor;
    const result = { ...armor };
    if ("martial" in result && result.isMartial === undefined) {
      result.isMartial = result.martial;
    }
    delete result.martial;
    if ("cost" in result && result.value === undefined) {
      result.value = result.cost;
    }
    delete result.cost;
    if (result.quality === undefined) {
      result.quality = "";
    }
    // Strip undefined values
    return Object.fromEntries(
      Object.entries(result).filter(([, v]) => v !== undefined),
    ) as typeof result;
  };
  return {
    ...npc,
    armor: normalizeArmor(npc.armor),
    shield: normalizeArmor(npc.shield),
  };
}

function defaultSpCost(npc: TypeNpc): TypeNpc {
  return {
    ...npc,
    actions: npc.actions?.map((a) => ({ ...a, spCost: a.spCost ?? 0 })),
    special: npc.special?.map((s) => ({ ...s, spCost: s.spCost ?? 0 })),
  };
}

function defaultImmunities(npc: TypeNpc): TypeNpc {
  return {
    ...npc,
    immunities: {
      slow: false,
      dazed: false,
      weak: false,
      shaken: false,
      enraged: false,
      poisoned: false,
      ...npc.immunities,
    },
  };
}

function normalizeSpellFields(npc: TypeNpc): TypeNpc {
  if (!npc.spells?.length) return npc;
  return {
    ...npc,
    spells: npc.spells.map((spell) => {
      const s = { ...spell };

      // target + targetDesc -> targetDescription
      if (s.targetDescription === undefined) {
        const legacy = s as unknown as Record<string, string | undefined>;
        s.targetDescription = legacy.targetDesc ?? legacy.target ?? "";
      }
      delete (s as unknown as Record<string, unknown>).target;
      delete (s as unknown as Record<string, unknown>).targetDesc;

      {
        const raw = s as unknown as Record<string, unknown>;
        if (raw.cost === undefined) {
          let amount = 0;
          if (raw.mp !== undefined) {
            const match = String(raw.mp).match(/\d+/);
            amount = match ? parseInt(match[0], 10) : 0;
          }
          raw.cost = { resource: "mp", amount, perTarget: true };
        }
        delete raw.mp;
      }

      if (s.damage === undefined)
        s.damage = 0 as unknown as {
          value: number;
          type: Elements;
          hrZero: boolean;
        };
      if (typeof s.damage === "object" && s.damage !== null) {
        const dmg = s.damage as unknown as Record<string, unknown>;
        s.damage = {
          ...dmg,
          type: normalizeElementType(dmg.type),
          hrZero: dmg.hrZero === true,
        } as unknown as typeof s.damage;
      }
      if (s.maxTargets === undefined) s.maxTargets = 0;
      if (s.description === undefined) s.description = "";

      return s;
    }),
  };
}

function unifyNpcSpellSchema(npc: TypeNpc): TypeNpc {
  if (!npc.spells?.length) return npc;
  return {
    ...npc,
    spells: npc.spells.map((spell) => {
      const s = { ...spell } as Record<string, unknown>;

      // type -> isOffensive; drop type
      if (s.isOffensive === undefined) {
        s.isOffensive = s.type === "offensive";
      }
      delete s.type;

      // damage + damagetype -> damage object; drop damagetype
      const flatDamage = typeof s.damage === "number" ? s.damage : 0;
      const damageType =
        typeof s.damagetype === "string"
          ? normalizeElementType(s.damagetype)
          : "physical";
      s.damage = {
        value: flatDamage,
        type: damageType as Elements,
        hrZero:
          (s.damage as Record<string, unknown> | undefined)?.hrZero === true,
      };
      delete s.damagetype;

      if (s.range === undefined) s.range = "ranged";
      if (s.itemType === undefined) s.itemType = "spell";
      if (s.spellType === undefined) s.spellType = "npc";
      if (s.description === undefined) s.description = "";
      if (s.special === undefined) s.special = [];

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

      return s as unknown as typeof spell;
    }),
  };
}

function unifyNpcAttackSchema(npc: TypeNpc): TypeNpc {
  type RawAttack = Record<string, unknown>;

  const categoryDefense = (_category: string): "def" | "mdef" => "def";

  const normalizeRange = (range: unknown): "melee" | "ranged" =>
    range === "ranged" || range === "distance" ? "ranged" : "melee";

  const normalizeWeaponCategory = (category: string | undefined): string =>
    category === "spear_category" ? "Spear" : (category ?? "");

  const migrateAttack = (a: RawAttack): RawAttack => {
    if (
      a.accuracy !== undefined &&
      a.damage !== undefined &&
      typeof a.damage === "object"
    ) {
      return {
        ...a,
        itemType: "attack",
        range: normalizeRange(a.range),
        damage: {
          ...(a.damage as Record<string, unknown>),
          type: normalizeElementType(
            (a.damage as Record<string, unknown>).type,
          ),
          hrZero: (a.damage as Record<string, unknown>).hrZero === true,
        },
        special: Array.isArray(a.special)
          ? a.special
          : typeof a.special === "string"
            ? [a.special]
            : [],
      };
    }
    const next: RawAttack = { ...a };
    next.itemType = "attack";
    next.range = normalizeRange(a.range);
    next.special = Array.isArray(a.special)
      ? a.special
      : typeof a.special === "string"
        ? [a.special]
        : [];
    next.accuracy = {
      attr1: (a.attr1 as string) ?? "dexterity",
      attr2: (a.attr2 as string) ?? "might",
      value: 0,
      defense: "def",
    };
    next.damage = {
      value: 0,
      type: normalizeElementType((a.type as string) ?? "physical"),
      hrZero: false,
    };
    delete next.attr1;
    delete next.attr2;
    delete next.type;
    return next;
  };

  const migrateWeaponAttack = (wa: RawAttack): RawAttack => {
    if (
      wa.accuracy !== undefined &&
      wa.damage !== undefined &&
      typeof wa.damage === "object"
    ) {
      const category = normalizeWeaponCategory(
        wa.category as string | undefined,
      );
      return {
        ...wa,
        itemType: "weaponAttack",
        category,
        range: normalizeRange(wa.range),
        special: Array.isArray(wa.special)
          ? wa.special
          : typeof wa.special === "string"
            ? [wa.special]
            : [],
        accuracy: {
          ...(wa.accuracy as Record<string, unknown>),
          defense: (wa.accuracy as Record<string, unknown>).defense
            ? ((wa.accuracy as Record<string, unknown>).defense as
                | "def"
                | "mdef")
            : categoryDefense(category),
        },
        damage: {
          ...(wa.damage as Record<string, unknown>),
          type: normalizeElementType(
            (wa.damage as Record<string, unknown>).type,
          ),
          hrZero: (wa.damage as Record<string, unknown>).hrZero === true,
        },
      };
    }
    const w = (wa.weapon as RawAttack) ?? {};
    const next: RawAttack = { ...wa };
    const category = normalizeWeaponCategory(w.category as string | undefined);
    next.itemType = "weaponAttack";
    next.category = category;
    next.special = Array.isArray(wa.special)
      ? wa.special
      : typeof wa.special === "string"
        ? [wa.special]
        : [];
    next.accuracy = {
      attr1: (w.att1 as string) ?? "dexterity",
      attr2: (w.att2 as string) ?? "might",
      value: typeof w.prec === "number" ? w.prec : 0,
      defense: categoryDefense(category),
    };
    next.damage = {
      value: typeof w.damage === "number" ? w.damage : 0,
      type: normalizeElementType((w.type as string) ?? "physical"),
      hrZero: false,
    };
    next.range = normalizeRange(w.range ?? wa.range);
    delete next.weapon;
    delete next.type;
    return next;
  };

  return {
    ...npc,
    attacks: (npc.attacks ?? []).map((a) =>
      migrateAttack(a as unknown as RawAttack),
    ) as unknown as typeof npc.attacks,
    weaponattacks: (npc.weaponattacks ?? []).map((wa) =>
      migrateWeaponAttack(wa as unknown as RawAttack),
    ) as unknown as typeof npc.weaponattacks,
  };
}

function unifyNpcDefensiveEquipmentSchema(npc: TypeNpc): TypeNpc {
  return {
    ...npc,
    armor: normalizeDefensiveItem(npc.armor),
    shield: normalizeDefensiveItem(npc.shield),
  };
}

const ALL_AFFINITY_KEYS = [
  "physical",
  "air",
  "bolt",
  "dark",
  "earth",
  "fire",
  "ice",
  "light",
  "poison",
] as const;

function actorAlignmentV10(npc: TypeNpc): TypeNpc {
  // 1. Fill any affinity keys still missing after v2 (which only guaranteed fire)
  const affinities = { ...npc.affinities };
  for (const key of ALL_AFFINITY_KEYS) {
    if (affinities[key] === undefined) affinities[key] = Affinities.None;
  }

  // 2. Migrate attribute flat numbers to { base } shape
  const rawAttrs = npc.attributes as unknown as Record<string, unknown>;
  const attributes: NpcAttributes = {
    might: {
      base:
        (rawAttrs.might as { base?: number } | undefined)?.base ??
        (rawAttrs.might as number | undefined) ??
        8,
    },
    insight: {
      base:
        (rawAttrs.insight as { base?: number } | undefined)?.base ??
        (rawAttrs.insight as number | undefined) ??
        8,
    },
    will: {
      base:
        (rawAttrs.will as { base?: number } | undefined)?.base ??
        (rawAttrs.will as number | undefined) ??
        8,
    },
    dexterity: {
      base:
        (rawAttrs.dexterity as { base?: number } | undefined)?.base ??
        (rawAttrs.dexterity as number | undefined) ??
        8,
    },
  };

  // 3. Migrate numeric and boolean NpcExtra fields into resources / derived / features
  const extra =
    (npc.extra as typeof npc.extra & {
      hp?: number;
      mp?: number;
      def?: number;
      mDef?: number;
      defOverride?: boolean;
      mDefOverride?: boolean;
      extrainit?: number;
      init?: boolean;
      precision?: boolean;
      magic?: boolean;
    }) ?? {};

  const resources: NpcResources = {
    hp: {
      current: npc.resources?.hp.current ?? calcHP({ ...npc, attributes }),
      bonus: extra.hp ?? 0,
    },
    mp: {
      current: npc.resources?.mp.current ?? calcMP({ ...npc, attributes }),
      bonus: extra.mp ?? 0,
    },
  };

  const derived: NpcDerived = {
    def: {
      bonus: extra.defOverride ? 0 : (extra.def ?? 0),
      ...(extra.defOverride ? { override: extra.def ?? 0 } : {}),
    },
    mdef: {
      bonus: extra.mDefOverride ? 0 : (extra.mDef ?? 0),
      ...(extra.mDefOverride ? { override: extra.mDef ?? 0 } : {}),
    },
    init: { bonus: extra.extrainit ?? 0 },
  };

  const incomingFeatures: NpcFeatures = {
    ...(extra.init ? { init: { enabled: true } } : {}),
    ...(extra.precision ? { precision: { enabled: true } } : {}),
    ...(extra.magic ? { magic: { enabled: true } } : {}),
  };
  const features =
    Object.keys(incomingFeatures).length > 0
      ? { ...npc.features, ...incomingFeatures }
      : npc.features;

  // 4. Strip all migrated fields from extra; keep only statusImmunity
  const {
    hp: _hp,
    mp: _mp,
    def: _def,
    mDef: _mDef,
    defOverride: _defOv,
    mDefOverride: _mDefOv,
    extrainit: _ei,
    init: _i,
    precision: _p,
    magic: _m,
    ...remainingExtra
  } = extra;

  return {
    ...npc,
    affinities,
    attributes,
    resources,
    derived,
    features,
    extra: Object.keys(remainingExtra).length > 0 ? remainingExtra : undefined,
  };
}

const POST_LOAD_TRANSFORMS: VersionedTransform[] = [
  {
    version: 1,
    label: "Fix sheild typo",
    fn: fixSheildTypo,
  },
  {
    version: 2,
    label: "Add missing fire affinity",
    fn: addMissingFireAffinity,
  },
  {
    version: 3,
    label:
      "Normalize armor and shield fields (martial to isMartial, cost to value, add quality default)",
    fn: normalizeArmorAndShieldFields,
  },
  {
    version: 4,
    label: "Default spCost to 0 on actions and special",
    fn: defaultSpCost,
  },
  {
    version: 5,
    label: "Default missing immunities keys to false",
    fn: defaultImmunities,
  },
  {
    version: 6,
    label:
      "Normalize spell fields: targetDescription, cost (mp), damage, maxTargets, description",
    fn: normalizeSpellFields,
  },
  {
    version: 7,
    label:
      "Unify NPC spell schema: isOffensive, damage object, range, itemType, spellType",
    fn: unifyNpcSpellSchema,
  },
  {
    version: 8,
    label:
      "Unify NPC attack schema: accuracy/damage objects, flatten attr1/attr2 and weapon fields",
    fn: unifyNpcAttackSchema,
  },
  {
    version: 9,
    label:
      "Unify NPC armor/shield schema: normalize martial, cost/value, and precision modifier parity",
    fn: unifyNpcDefensiveEquipmentSchema,
  },
  {
    version: 10,
    label:
      "Actor alignment v10: shared interfaces; attributes { base } shape; resources/derived layout; NpcExtra numeric/boolean fields migrated",
    fn: actorAlignmentV10,
  },
];

export const NPC_CURRENT_SCHEMA_VERSION =
  POST_LOAD_TRANSFORMS.length > 0
    ? POST_LOAD_TRANSFORMS[POST_LOAD_TRANSFORMS.length - 1].version
    : 0;

export function applyNpcPostLoadTransforms(npc: TypeNpc): TypeNpc {
  let result = POST_LOAD_TRANSFORMS.reduce((n, t) => {
    if (n.schemaVersion !== undefined && n.schemaVersion >= t.version) return n;
    return { ...t.fn(n), schemaVersion: t.version };
  }, npc);
  if ((result.schemaVersion ?? 0) < NPC_CURRENT_SCHEMA_VERSION) {
    result = { ...result, schemaVersion: NPC_CURRENT_SCHEMA_VERSION };
  }
  return result;
}

// Migration detection

/** Returns the labels of transforms that would be applied to this NPC. */
export function getPendingNpcMigrations(npc: TypeNpc): string[] {
  const current = npc.schemaVersion ?? 0;
  return POST_LOAD_TRANSFORMS.filter((t) => t.version > current).map(
    (t) => t.label,
  );
}

/** Returns true if the NPC would be changed by applyNpcPostLoadTransforms. */
export function npcNeedsMigration(npc: TypeNpc): boolean {
  return (npc.schemaVersion ?? 0) < NPC_CURRENT_SCHEMA_VERSION;
}
