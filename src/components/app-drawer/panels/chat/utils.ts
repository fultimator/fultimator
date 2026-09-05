export const formatTimeAgo = (createdAt: number): string => {
  const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (elapsed < 60) return `${elapsed}s ago`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
  return `${Math.floor(elapsed / 86400)}d ago`;
};
