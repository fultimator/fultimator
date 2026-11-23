// Creation / modification timestamps for actor documents (NPCs and PCs).
// Plain Date.now() numbers so they work on both Firestore and IndexedDB.

// Bumps updatedAt; keeps createdAt, or seeds it (e.g. from publishedAt).
export function stampSave<T extends Record<string, unknown>>(
  data: T,
  seed?: number,
): T & { createdAt: number; updatedAt: number } {
  const now = Date.now();
  const existingCreatedAt =
    typeof data.createdAt === "number" ? (data.createdAt as number) : undefined;
  return {
    ...data,
    createdAt: existingCreatedAt ?? seed ?? now,
    updatedAt: now,
  };
}

// Stamps a brand-new document: both createdAt and updatedAt set to now.
export function stampCreate<T extends Record<string, unknown>>(
  data: T,
): T & { createdAt: number; updatedAt: number } {
  const now = Date.now();
  return { ...data, createdAt: now, updatedAt: now };
}

// Comparator for client-side sorting; missing timestamps sort as earliest.
export function compareTimestamps(
  a: number | undefined,
  b: number | undefined,
): number {
  return (a ?? 0) - (b ?? 0);
}
