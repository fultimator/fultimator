export function canLevelUpFromExp(player) {
  const exp = parseInt(player?.info?.exp, 10) || 0;
  const lvl = player?.lvl || 0;
  return exp >= 10 && lvl < 50;
}

export function applyExpLevelUp(player, options = {}) {
  if (!player || !canLevelUpFromExp(player)) return player;

  const { recalculateMaxStats, afterLevelUp } = options;
  const currentExp = parseInt(player?.info?.exp, 10) || 0;
  const nextBase = {
    ...player,
    lvl: Math.min(50, (player?.lvl || 0) + 1),
    info: { ...player.info, exp: Math.max(0, currentExp - 10) },
  };

  const withStats = recalculateMaxStats
    ? recalculateMaxStats(nextBase)
    : nextBase;

  return afterLevelUp ? afterLevelUp(withStats) : withStats;
}
