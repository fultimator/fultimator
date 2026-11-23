import { t } from "../../../../translation/translate";

export const formatTimeAgo = (createdAt: number): string => {
  const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (elapsed < 60) return t("{0}s ago", [elapsed]);
  if (elapsed < 3600) return t("{0}m ago", [Math.floor(elapsed / 60)]);
  if (elapsed < 86400) return t("{0}h ago", [Math.floor(elapsed / 3600)]);
  return t("{0}d ago", [Math.floor(elapsed / 86400)]);
};
