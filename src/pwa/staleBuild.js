// Reload once when a tab from a previous deploy requests a removed chunk.
const KEY = "staleBuildReloadAt";

const STALE_CHUNK =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

export const isStaleChunkError = (error) =>
  STALE_CHUNK.test(error?.message ?? "");

export function reloadForNewBuild() {
  try {
    // Skip if we just reloaded, so a truly missing chunk can't loop.
    if (Date.now() - Number(sessionStorage.getItem(KEY)) < 10_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}
