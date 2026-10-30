// Role seeds an NPC's four attribute dice from a level-based lookup; the NPC calc
// then derives HP/MP/init/accuracy/damage from attributes + level + rank.

const ATTRS = ["dexterity", "insight", "might", "will"];

export const QA_ROLES = {
  brute: [
    [8, 6, 10, 8],
    [8, 8, 10, 8],
    [8, 8, 12, 8],
    [8, 8, 12, 10],
  ],
  hunter: [
    [10, 8, 8, 6],
    [10, 8, 8, 8],
    [12, 8, 8, 8],
    [12, 10, 8, 8],
  ],
  mage: [
    [8, 8, 6, 10],
    [8, 10, 6, 10],
    [8, 10, 6, 12],
    [8, 10, 8, 12],
  ],
  saboteur: [
    [8, 8, 8, 8],
    [8, 8, 8, 10],
    [8, 10, 8, 10],
    [10, 10, 8, 10],
  ],
  sentinel: [
    [8, 8, 8, 8],
    [8, 8, 10, 8],
    [8, 8, 10, 10],
    [10, 8, 10, 10],
  ],
  support: [
    [8, 8, 6, 10],
    [8, 10, 6, 10],
    [8, 10, 8, 10],
    [8, 12, 8, 10],
  ],
};

// Flat HP/DEF/M.DEF modifiers not covered by the attribute/level formulas.
// Brute's level-50+ HP bump lives in getRoleHpBonus, not here.
export const QA_ROLE_DEFAULTS = {
  brute: { hp: 10, def: 0, mDef: 0 },
  hunter: { hp: 0, def: 0, mDef: 0 },
  mage: { hp: 0, def: 1, mDef: 2 },
  saboteur: { hp: 0, def: 1, mDef: 2 },
  sentinel: { hp: 0, def: 2, mDef: 1 },
  support: { hp: 10, def: 0, mDef: 0 },
};

export function getRoleHpBonus(role, level) {
  const base = QA_ROLE_DEFAULTS[role]?.hp ?? 0;
  if (role === "brute" && Number(level) >= 50) return base + 10;
  return base;
}

// Excludes "custom" (the freeform NPC when Quick Assembly is off).
export const QA_ROLE_KEYS = Object.keys(QA_ROLES);

export const QA_LEVELS = [5, 10, 20, 30, 40, 50, 60];

export function isQuickAssemblyRole(role) {
  return typeof role === "string" && role in QA_ROLES;
}

// Snap to the nearest allowed level (ties round down).
export function clampQuickAssemblyLevel(level) {
  const n = Number(level);
  if (!Number.isFinite(n)) return QA_LEVELS[0];
  return QA_LEVELS.reduce((best, lvl) =>
    Math.abs(lvl - n) < Math.abs(best - n) ? lvl : best,
  );
}

// Attribute dice { dexterity, insight, might, will } for a role/level, or null.
export function getRoleAttributesForLevel(role, level) {
  const steps = QA_ROLES[role];
  if (!steps) return null;
  const step = Math.min(3, Math.max(0, Math.floor(Number(level) / 20)));
  return Object.fromEntries(ATTRS.map((attr, i) => [attr, steps[step][i]]));
}

// Accuracy/Magic check bonus: +1 per 10 levels.
export function getRoleAccuracyBonus(level) {
  return Math.floor(Number(level) / 10);
}

// Attacks/Spells extra damage: +5 per 20 levels.
export function getRoleDamageBonus(level) {
  return Math.floor(Number(level) / 20) * 5;
}

const ATTR_SHORT = {
  dexterity: "DEX",
  insight: "INS",
  might: "MIG",
  will: "WLP",
};

// Mirrors calcHP/calcMP in libs/npcs.js for a base-rank NPC.
function roleHp(role, attrs, level) {
  return 2 * Number(level) + 5 * attrs.might + getRoleHpBonus(role, level);
}
function roleMp(attrs, level) {
  return Number(level) + 5 * attrs.will;
}

// e.g. "INS d10; WLP d10" for attributes raised above their level-5 base.
function attributeChangeLabel(role, level) {
  const base = getRoleAttributesForLevel(role, 5);
  const current = getRoleAttributesForLevel(role, level);
  if (!base || !current) return "";
  const parts = [];
  for (const attr of ATTRS) {
    if (current[attr] > base[attr]) {
      parts.push(`${ATTR_SHORT[attr]} d${current[attr]}`);
    }
  }
  return parts.join("; ");
}

// One row per level breakpoint above 5, for the higher-level stat chart.
export function getRoleProgression(role) {
  if (!QA_ROLES[role]) return [];
  return QA_LEVELS.filter((lvl) => lvl > 5).map((level) => {
    const attrs = getRoleAttributesForLevel(role, level);
    return {
      level,
      attributeChange: attributeChangeLabel(role, level),
      hp: roleHp(role, attrs, level),
      mp: roleMp(attrs, level),
      accuracyBonus: getRoleAccuracyBonus(level),
      damageBonus: getRoleDamageBonus(level),
    };
  });
}

export function getRoleDefaults(role) {
  return QA_ROLE_DEFAULTS[role] ?? { hp: 0, def: 0, mDef: 0 };
}

export function attributesMatchRole(npc, role, level) {
  if (!QA_ROLES[role]) return false;
  const applied = applyRole(npc, { role, level });
  const eq = (a, b) => (a ?? null) === (b ?? null);

  for (const attr of ATTRS) {
    if (!eq(npc?.attributes?.[attr]?.base, applied?.attributes?.[attr]?.base)) {
      return false;
    }
  }
  return (
    eq(npc?.extra?.hp, applied?.extra?.hp) &&
    eq(npc?.extra?.def, applied?.extra?.def) &&
    eq(npc?.extra?.mDef, applied?.extra?.mDef) &&
    eq(npc?.resources?.hp?.bonus, applied?.resources?.hp?.bonus) &&
    eq(npc?.derived?.def?.bonus, applied?.derived?.def?.bonus) &&
    eq(npc?.derived?.mdef?.bonus, applied?.derived?.mdef?.bonus)
  );
}

// Set the four attribute bases and the role's flat HP/DEF/M.DEF modifiers.
// Pure; returns the NPC unchanged for "custom" or an unknown role.
export function applyRole(npc, { role, level } = {}) {
  const nextRole = role ?? npc?.role ?? "custom";
  const nextLvl = level ?? npc?.lvl ?? 5;
  const next = { ...npc, role: nextRole, lvl: nextLvl };

  const target = getRoleAttributesForLevel(nextRole, nextLvl);
  if (!target) return next;

  const attributes = { ...next.attributes };
  for (const attr of ATTRS) {
    attributes[attr] = { ...attributes[attr], base: target[attr] };
  }

  const defaults = getRoleDefaults(nextRole);
  const hpBonus = getRoleHpBonus(nextRole, nextLvl);
  const result = {
    ...next,
    attributes,
    extra: {
      ...next.extra,
      hp: hpBonus,
      def: defaults.def,
      mDef: defaults.mDef,
    },
  };

  if (next.resources) {
    result.resources = {
      ...next.resources,
      hp: { ...next.resources.hp, bonus: hpBonus },
    };
  }
  if (next.derived) {
    result.derived = {
      ...next.derived,
      def:
        next.derived.def?.override !== undefined
          ? next.derived.def
          : { ...next.derived.def, bonus: defaults.def },
      mdef:
        next.derived.mdef?.override !== undefined
          ? next.derived.mdef
          : { ...next.derived.mdef, bonus: defaults.mDef },
    };
  }

  return result;
}
