// Unified database hook. Returns a DatabaseAdapter for the active mode (default)
// or an explicitly requested mode. The cloud adapter is transparently proxied to
// auto-inject uid on user-scoped collections so components never handle it manually.

import { useMemo } from "react";
import { useDatabaseContext } from "../context/DatabaseContext";
import { USER_SCOPED_COLLECTIONS, type DatabaseAdapter, type DbMode } from "../types/Database";

function buildUidProxy(adapter: DatabaseAdapter, uid: string): DatabaseAdapter {
  return {
    ...adapter,

    // Auto-inject where("uid", "==", uid) for user-scoped collections on reads.
    query(ref: unknown, ...constraints: unknown[]) {
      const storeName = extractStoreName(ref);
      if (storeName && USER_SCOPED_COLLECTIONS.has(storeName)) {
        const uidConstraint = adapter.where("uid", "==", uid);
        return adapter.query(ref, uidConstraint, ...constraints);
      }
      return adapter.query(ref, ...constraints);
    },

    // Auto-inject uid field for user-scoped collections on writes.
    async addDoc(ref: unknown, data: Record<string, unknown>) {
      const storeName = extractStoreName(ref);
      if (storeName && USER_SCOPED_COLLECTIONS.has(storeName)) {
        return adapter.addDoc(ref, { ...data, uid });
      }
      return adapter.addDoc(ref, data);
    },
  };
}

// Extracts the collection/store name from a Firestore CollectionRef or an IDB CollectionRef.
// Firestore refs have a .path property like "npc-personal" or "users/uid/npc-personal".
// IDB CollectionRef has a .storeName property.
function extractStoreName(ref: unknown): string | null {
  if (!ref || typeof ref !== "object") return null;
  const r = ref as Record<string, unknown>;
  // IDB CollectionRef shape
  if (typeof r["storeName"] === "string") return r["storeName"];
  // Firestore CollectionReference - last segment of the path
  if (typeof r["path"] === "string") {
    const parts = (r["path"] as string).split("/");
    return parts[parts.length - 1] ?? null;
  }
  return null;
}

export function useDatabase(mode?: DbMode): DatabaseAdapter {
  const ctx = useDatabaseContext();

  const adapter = mode
    ? mode === "cloud"
      ? ctx.cloudAdapter
      : ctx.localAdapter
    : ctx.activeAdapter;

  // Determine the uid to inject. For cross-adapter calls ("cloud" requested explicitly),
  // use the cloud user's uid. For "local" or active-local, no proxy is needed.
  const isCloudAdapter = adapter === ctx.cloudAdapter;
  const uid = ctx.cloudUser?.uid ?? null;

  return useMemo(() => {
    if (isCloudAdapter && uid) {
      return buildUidProxy(adapter, uid);
    }
    return adapter;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, isCloudAdapter, uid]);
}
