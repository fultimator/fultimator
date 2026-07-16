/**
 * Stable per-instance identifiers for actor inventory items.
 */

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureId<T extends { id?: string }>(item: T): T {
  return item.id ? item : { ...item, id: generateId() };
}

export function backfillIds<T extends { id?: string }>(
  items: T[] | undefined,
): T[] | undefined {
  if (!items) return items;
  return items.map((item) => ensureId(item));
}
