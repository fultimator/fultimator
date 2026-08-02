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
