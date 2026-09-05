export function getClassSkillLevelTotal(classItem) {
  return (classItem?.skills ?? []).reduce(
    (total, skill) => total + (Number(skill?.currentLvl) || 0),
    0,
  );
}

export function getDerivedClassLevel(classItem) {
  return Math.max(0, Math.min(10, getClassSkillLevelTotal(classItem)));
}

export function isAutomaticClassLevelEnabled(player) {
  if (player?.settings?.optionalRules?.technospheres) return true;
  return player?.settings?.automaticClassLevel !== false;
}

export function syncAutomaticClassLevels(player) {
  if (!isAutomaticClassLevelEnabled(player)) return player;

  return {
    ...player,
    classes: (player?.classes ?? []).map((classItem) => ({
      ...classItem,
      lvl: getDerivedClassLevel(classItem),
    })),
    settings: {
      ...(player?.settings ?? {}),
      automaticClassLevel: true,
    },
  };
}
