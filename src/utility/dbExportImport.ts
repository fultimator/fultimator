import { getDb, notifyAllListeners } from "../platform/idb";

// Canonical export format - matches the original fultimator-desktop schema.
const STORE_TO_KEY: Record<string, string> = {
  "npc-personal": "npcs",
  "player-personal": "pcs",
  "encounters": "encounters",
};

// Reverse map derived from STORE_TO_KEY.
const KEY_TO_STORE: Record<string, string> = Object.fromEntries(
  Object.entries(STORE_TO_KEY).map(([store, key]) => [key, store])
);

/** Download the database as fultimatordb.json using the traditional key names. */
export async function exportDatabase(): Promise<void> {
  const db = await getDb();
  const snapshot: Record<string, unknown[]> = {};
  for (const [store, key] of Object.entries(STORE_TO_KEY)) {
    snapshot[key] = await db.getAll(store);
  }
  const blob = new Blob([JSON.stringify(snapshot)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fultimatordb.json";
  a.click();
  URL.revokeObjectURL(url);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normaliseRecord(record: unknown): unknown {
  if (typeof record !== "object" || record === null) return record;
  const r = record as Record<string, unknown>;
  // Assign a UUID if the record has a non-UUID id (e.g. legacy integer ids).
  const id = typeof r.id === "string" && UUID_RE.test(r.id) ? r.id : crypto.randomUUID();
  // Strip Firestore-only fields - local records can never be published,
  // and the original uid would lock the record to a foreign Firebase account.
  const { published: _pub, uid: _uid, ...rest } = r;
  return { ...rest, id };
}

/** Replace the database from an imported fultimatordb.json file. */
export async function importDatabase(file: File): Promise<void> {
  const text = await file.text();
  const raw = JSON.parse(text) as Record<string, unknown[]>;
  const db = await getDb();
  for (const [key, store] of Object.entries(KEY_TO_STORE)) {
    if (!(key in raw)) continue;
    const records = (Array.isArray(raw[key]) ? raw[key] : []).map(normaliseRecord);
    const tx = db.transaction(store, "readwrite");
    await tx.store.clear();
    for (const record of records) await tx.store.put(record);
    await tx.done;
  }
  notifyAllListeners();
}
