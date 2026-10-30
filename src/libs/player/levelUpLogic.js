export const MIN_LEVEL = 5;
export const MAX_LEVEL = 50;

export function clampLevel(value, { min = MIN_LEVEL, max = MAX_LEVEL } = {}) {
  const parsed = typeof value === "number" ? value : parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

export function canLevelUpFromExp(player) {
  const exp = parseInt(player?.info?.exp, 10) || 0;
  const lvl = player?.lvl || 0;
  return exp >= 10 && lvl < MAX_LEVEL;
}

export function applyExpLevelUp(player, options = {}) {
  if (!player || !canLevelUpFromExp(player)) return player;

  const { recalculateMaxStats, afterLevelUp } = options;
  const currentExp = parseInt(player?.info?.exp, 10) || 0;
  const nextBase = {
    ...player,
    lvl: Math.min(MAX_LEVEL, (player?.lvl || 0) + 1),
    info: { ...player.info, exp: Math.max(0, currentExp - 10) },
  };

  const withStats = recalculateMaxStats
    ? recalculateMaxStats(nextBase)
    : nextBase;

  return afterLevelUp ? afterLevelUp(withStats) : withStats;
}
