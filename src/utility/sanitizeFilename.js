export function sanitizeFilename(name) {
  const safe = String(name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return safe || "unnamed";
}

export function createUniqueFilenameTracker() {
  const seen = new Map();
  return (name) => {
    const base = sanitizeFilename(name);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count}`;
  };
}
