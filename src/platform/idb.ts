// Shared IndexedDB primitives - used by desktop/db.ts and web/drive.ts.
// IndexedDB is a browser API available in both Electron (renderer) and web browsers.

import { useState, useEffect } from "react";
import { openDB, type IDBPDatabase } from "idb";

export const STORES = [
  "npc-personal",
  "npc-official",
  "player-personal",
  "encounters",
  "rolls",
  "rolls-prepared",
  "compendium-packs",
] as const;

export type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB("fultimator", 2, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" });
          }
        }
      },
      blocking() {
        if (dbPromise) {
          dbPromise.then((db) => db.close());
          dbPromise = null;
        }
      },
      terminated() {
        dbPromise = null;
      },
    }).then((db) => {
      db.onclose = () => {
        dbPromise = null;
      };
      return db;
    });
  }
  return dbPromise;
}

// Pending sync flag - set on any write, cleared after a successful Drive sync

const PENDING_SYNC_KEY = "fultimator_pending_sync";
const PENDING_SYNC_EVENT = "fultimator:sync-pending-changed";

export function markPendingSync(): void {
  try {
    localStorage.setItem(PENDING_SYNC_KEY, "1");
  } catch {
    // localStorage not available
  }
  window.dispatchEvent(new Event(PENDING_SYNC_EVENT));
}

export function clearPendingSync(): void {
  try {
    localStorage.removeItem(PENDING_SYNC_KEY);
  } catch {
    // localStorage not available
  }
  window.dispatchEvent(new Event(PENDING_SYNC_EVENT));
}

export function hasPendingSync(): boolean {
  try {
    return localStorage.getItem(PENDING_SYNC_KEY) === "1";
  } catch {
    // localStorage not available
    return false;
  }
}

export function usePendingSync(): boolean {
  const [pending, setPending] = useState(hasPendingSync);
  useEffect(() => {
    const handler = () => setPending(hasPendingSync());
    window.addEventListener(PENDING_SYNC_EVENT, handler);
    return () => window.removeEventListener(PENDING_SYNC_EVENT, handler);
  }, []);
  return pending;
}

// Pub/sub - write operations notify subscribers so hooks re-fetch
type Listener = () => void;
const storeListeners = new Map<string, Set<Listener>>();

export function notifyListeners(storeName: string): void {
  markPendingSync();
  storeListeners.get(storeName)?.forEach((fn) => fn());
}

export function subscribeToStore(
  storeName: string,
  listener: Listener,
): () => void {
  if (!storeListeners.has(storeName)) storeListeners.set(storeName, new Set());
  storeListeners.get(storeName)!.add(listener);
  return () => storeListeners.get(storeName)?.delete(listener);
}

/** Notify listeners for every store (called after a full restore from Drive). */
export function notifyAllListeners(): void {
  for (const store of STORES) notifyListeners(store);
}
