// Quick Assembly level-up grants ("New skills and abilities" charts), as level-gated
// slots per role.
export const QA_LEVEL_GRANTS = {
  brute: [
    { level: 10, kind: "resistance", count: 2, note: "other than physical" },
    { level: 20, kind: "roleSkill", count: 1 },
    { level: 30, kind: "immunity", count: 1 },
    { level: 40, kind: "roleSkill", count: 1 },
    { level: 50, kind: "hp" },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
  hunter: [
    { level: 10, kind: "accuracyBonus" },
    { level: 20, kind: "roleSkill", count: 1 },
    {
      level: 30,
      kind: "attackMod",
      text: "role_grant_attackmod_ignore_resistances",
    },
    { level: 40, kind: "roleSkill", count: 1 },
    { level: 50, kind: "resistance", count: 2 },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
  mage: [
    { level: 10, kind: "attackMod", text: "role_grant_attackmod_target_mdef" },
    { level: 20, kind: "roleSkill", count: 1 },
    { level: 30, kind: "immunity", count: 1 },
    { level: 40, kind: "roleSkill", count: 1 },
    { level: 50, kind: "magicBonus" },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
  saboteur: [
    { level: 10, kind: "accuracyOrMagic" },
    { level: 20, kind: "roleSkill", count: 1 },
    {
      level: 30,
      kind: "attackMod",
      text: "role_grant_attackmod_ignore_resistances",
    },
    { level: 40, kind: "roleSkill", count: 1 },
    { level: 50, kind: "immunity", count: 1 },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
  sentinel: [
    { level: 10, kind: "resistance", count: 2, note: "other than physical" },
    { level: 20, kind: "roleSkill", count: 1 },
    { level: 30, kind: "defBonus", def: 2, mdef: 1 },
    { level: 40, kind: "roleSkill", count: 1 },
    {
      level: 50,
      kind: "statusImmunity",
      count: 2,
      options: ["poisoned", "shaken", "weak"],
    },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
  support: [
    { level: 10, kind: "resistance", count: 2, note: "other than physical" },
    { level: 20, kind: "roleSkill", count: 1 },
    { level: 30, kind: "defBonus", def: 1, mdef: 2 },
    { level: 40, kind: "roleSkill", count: 1 },
    { level: 50, kind: "immunity", count: 1, note: "other than physical" },
    { level: 60, kind: "roleSkill", count: 1 },
  ],
};

export function getUnlockedGrants(role, level) {
  const lvl = Number(level);
  return (QA_LEVEL_GRANTS[role] ?? []).filter((g) => g.level <= lvl);
}

export function getAllGrants(role, level) {
  const lvl = Number(level);
  return (QA_LEVEL_GRANTS[role] ?? []).map((g) => ({
    ...g,
    locked: g.level > lvl,
  }));
}

export function getRankExtras(rank) {
  if (rank === "elite") return { roleSkills: 1, bossSkills: 0 };
  const champion = /^champion([1-6])$/.exec(rank ?? "");
  if (champion) {
    return { roleSkills: Number(champion[1]), bossSkills: 1 };
  }
  return { roleSkills: 0, bossSkills: 0 };
}

export function getRankGrants(rank) {
  const { roleSkills, bossSkills } = getRankExtras(rank);
  const grants = [];
  if (roleSkills > 0) {
    grants.push({ source: "rank", kind: "roleSkill", count: roleSkills });
  }
  if (bossSkills > 0) {
    grants.push({ source: "rank", kind: "bossSkill", count: bossSkills });
  }
  return grants;
}

export const COUNTABLE_GRANT_KINDS = new Set([
  "resistance",
  "immunity",
  "statusImmunity",
  "accuracyBonus",
  "magicBonus",
  "accuracyOrMagic",
  "defBonus",
]);

export function isGrantCountable(grant) {
  return COUNTABLE_GRANT_KINDS.has(grant?.kind);
}

export function grantSlotId(grant, source, index) {
  if (source === "species") return `species-${index}`;
  if (grant.source === "rank" || source === "rank") return `rank-${grant.kind}`;
  if (grant.level != null) return `level-${grant.level}`;
  return `${grant.kind}-${index}`;
}

export function countAffinities(grant, npc, value) {
  const restrictNonPhysical = grant?.note === "other than physical";
  return Object.entries(npc?.affinities ?? {}).filter(
    ([type, v]) => v === value && !(restrictNonPhysical && type === "physical"),
  ).length;
}

export function isGrantApplied(grant, npc) {
  const need = grant?.count ?? 1;
  switch (grant?.kind) {
    case "resistance":
      return countAffinities(grant, npc, "rs") >= need;
    case "immunity":
      return countAffinities(grant, npc, "im") >= need;
    case "statusImmunity":
      return (
        (grant.options ?? []).filter((s) => npc?.immunities?.[s]).length >= need
      );
    case "accuracyBonus":
      return !!(npc?.features?.precision?.enabled ?? npc?.extra?.precision);
    case "magicBonus":
      return !!npc?.features?.magic?.enabled;
    case "accuracyOrMagic":
      return (
        !!(npc?.features?.precision?.enabled ?? npc?.extra?.precision) ||
        !!npc?.features?.magic?.enabled
      );
    case "defBonus":
      return (
        (npc?.extra?.def ?? 0) >= (grant.def ?? 0) &&
        (npc?.extra?.mDef ?? 0) >= (grant.mdef ?? 0)
      );
    default:
      return false;
  }
}
