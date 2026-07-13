// Quick Assembly roles: selecting a role seeds an NPC's four attribute dice from a
// level-based lookup.
// The existing NPC derives HP/MP/init, accuracy and damage from attributes + level
// + rank, so a role only needs to set attributes.

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

// "custom" is excluded: it is the classic freeform NPC (Quick Assembly toggle off).
export const QA_ROLE_KEYS = Object.keys(QA_ROLES);

// Levels a Quick Assembly NPC may occupy; the level picker is restricted to these.
export const QA_LEVELS = [5, 10, 20, 30, 40, 50, 60];

export function isQuickAssemblyRole(role) {
  return typeof role === "string" && role in QA_ROLES;
}

// Snap an arbitrary level to the nearest allowed breakpoint (ties round down).
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

// True when the NPC's attributes still match the role defaults for the given level,
// i.e. the GM has not hand-tuned them.
export function attributesMatchRole(npc, role, level) {
  const target = getRoleAttributesForLevel(role, level);
  if (!target) return false;
  return ATTRS.every(
    (attr) => (npc?.attributes?.[attr]?.base ?? null) === target[attr],
  );
}

// Set the four attribute bases from the role/level lookup. Pure; returns the NPC
// unchanged for the "custom" (or unknown) role.
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
  return { ...next, attributes };
}
