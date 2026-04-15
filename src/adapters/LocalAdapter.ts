// Local adapter - wraps src/platform/desktop/db.ts to implement DatabaseAdapter.
// Works on both Electron and web (both use the same IDB implementation).

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc as idbAddDoc,
  setDoc as idbSetDoc,
  deleteDoc as idbDeleteDoc,
  getDoc as idbGetDoc,
  getDocs as idbGetDocs,
  useCollectionData as idbUseCollectionData,
  useDocumentData as idbUseDocumentData,
} from "../platform/desktop/db";
import { getDb, STORES, usePendingSync } from "../platform/idb";
import type { DatabaseAdapter, DbError, WriteBatch } from "../types/Database";

function normalizeError(err: unknown): DbError {
  if (err instanceof DOMException) {
    if (err.name === "NotFoundError") return { code: "not-found", message: err.message, raw: err };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { code: "unknown", message, raw: err };
}

function normalizeCollectionResult(
  result: [unknown[], boolean, Error | undefined]
): [unknown[], boolean, DbError | null] {
  const [data, loading, err] = result;
  return [data, loading, err ? normalizeError(err) : null];
}

function normalizeDocumentResult(
  result: [unknown, boolean, Error | undefined]
): [unknown, boolean, DbError | null] {
  const [data, loading, err] = result;
  return [data, loading, err ? normalizeError(err) : null];
}

export const LocalAdapter: DatabaseAdapter = {
  collection: (path: string) => collection(null, path),

  doc: (path: string, id: string) => doc(null, path, id),

  query: (ref: unknown, ...constraints: unknown[]) =>
    query(ref as Parameters<typeof query>[0], ...(constraints as Parameters<typeof query>[1][])),

  where: (field, op, value) => where(field, op as string, value),

  orderBy: (field, direction) => orderBy(field, direction),

  limit: (n) => limit(n),

  startAfter: (snapshot) => startAfter(snapshot),

  async getDoc(ref: unknown) {
    try {
      const snapshot = await idbGetDoc(ref as Parameters<typeof idbGetDoc>[0]);
      return snapshot.exists() ? snapshot.data() : null;
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async getDocs(queryRef: unknown) {
    try {
      const result = await idbGetDocs(queryRef as Parameters<typeof idbGetDocs>[0]);
      return result.docs.map((d) => ({ ...(d.data() as object), id: d.id }));
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async addDoc(ref: unknown, data: Record<string, unknown>) {
    try {
      return await idbAddDoc(ref as Parameters<typeof idbAddDoc>[0], data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async setDoc(ref: unknown, data: Record<string, unknown>) {
    try {
      await idbSetDoc(ref as Parameters<typeof idbSetDoc>[0], data);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async deleteDoc(ref: unknown) {
    try {
      await idbDeleteDoc(ref as Parameters<typeof idbDeleteDoc>[0]);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  writeBatch(): WriteBatch {
    const ops: Array<{ type: "set" | "delete"; ref: unknown; data?: Record<string, unknown> }> = [];
    return {
      set(ref, data) {
        ops.push({ type: "set", ref, data: data as Record<string, unknown> });
      },
      delete(ref) {
        ops.push({ type: "delete", ref });
      },
      async commit() {
        for (const op of ops) {
          if (op.type === "set") {
            await idbSetDoc(op.ref as Parameters<typeof idbSetDoc>[0], op.data!);
          } else {
            await idbDeleteDoc(op.ref as Parameters<typeof idbDeleteDoc>[0]);
          }
        }
      },
    };
  },

  useCollectionData(queryRef: unknown) {
    return normalizeCollectionResult(
      idbUseCollectionData(queryRef as Parameters<typeof idbUseCollectionData>[0])
    );
  },

  useDocumentData(ref: unknown) {
    return normalizeDocumentResult(
      idbUseDocumentData(ref as Parameters<typeof idbUseDocumentData>[0])
    );
  },

  usePendingSync() {
    return usePendingSync();
  },

  async exportAll() {
    const db = await getDb();
    const result: Record<string, unknown[]> = {};
    for (const store of STORES) {
      result[store] = await db.getAll(store);
    }
    return result;
  },
};
