// Cloud adapter - wraps Firebase Firestore + react-firebase-hooks to implement DatabaseAdapter.
// Normalizes all Firestore errors to DbError before surfacing them to components.

import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc as fsAddDoc,
  setDoc as fsSetDoc,
  deleteDoc as fsDeleteDoc,
  getDoc as fsGetDoc,
  getDocs as fsGetDocs,
  writeBatch as fsWriteBatch,
  type CollectionReference,
  type DocumentReference,
  type Query,
} from "firebase/firestore";
import {
  useCollectionData as useCollectionDataFirestore,
  useDocumentData as useDocumentDataFirestore,
} from "react-firebase-hooks/firestore";
import { firestore } from "../firebase";
import { STORES, getDb } from "../platform/idb";
import type {
  DatabaseAdapter,
  DbError,
  DbErrorCode,
  WriteBatch,
} from "../types/Database";

function normalizeFirestoreError(err: unknown): DbError {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;
    const message = (err as { message?: string }).message ?? String(err);
    const mapped: Record<string, DbErrorCode> = {
      "resource-exhausted": "quota-exceeded",
      "permission-denied": "permission-denied",
      "not-found": "not-found",
      unavailable: "unavailable",
    };
    return { code: mapped[code] ?? "unknown", message, raw: err };
  }
  return { code: "unknown", message: String(err), raw: err };
}

export const CloudAdapter: DatabaseAdapter = {
  collection: (path: string) => collection(firestore, path),

  doc: (path: string, id: string) => doc(firestore, path, id),

  query: (ref: unknown, ...constraints: unknown[]) =>
    query(
      ref as CollectionReference | Query,
      ...(constraints as Parameters<typeof query>[1][]),
    ),

  where: (field, op, value) =>
    where(field, op as Parameters<typeof where>[1], value),

  orderBy: (field, direction) => orderBy(field, direction),

  limit: (n) => limit(n),

  startAfter: (snapshot) => startAfter(snapshot),

  async getDoc(ref: unknown) {
    try {
      const snapshot = await fsGetDoc(ref as DocumentReference);
      return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
    } catch (err) {
      throw normalizeFirestoreError(err);
    }
  },

  async getDocs(queryRef: unknown) {
    try {
      const snapshot = await fsGetDocs(queryRef as Query);
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    } catch (err) {
      throw normalizeFirestoreError(err);
    }
  },

  async addDoc(ref: unknown, data: Record<string, unknown>) {
    try {
      const docRef = await fsAddDoc(ref as CollectionReference, data);
      return { id: docRef.id };
    } catch (err) {
      throw normalizeFirestoreError(err);
    }
  },

  async setDoc(ref: unknown, data: Record<string, unknown>) {
    try {
      await fsSetDoc(ref as DocumentReference, data);
    } catch (err) {
      throw normalizeFirestoreError(err);
    }
  },

  async deleteDoc(ref: unknown) {
    try {
      await fsDeleteDoc(ref as DocumentReference);
    } catch (err) {
      throw normalizeFirestoreError(err);
    }
  },

  writeBatch(): WriteBatch {
    const batch = fsWriteBatch(firestore);
    return {
      set(ref, data) {
        batch.set(ref as DocumentReference, data as Record<string, unknown>);
      },
      delete(ref) {
        batch.delete(ref as DocumentReference);
      },
      async commit() {
        await batch.commit();
      },
    };
  },

  useCollectionData(queryRef: unknown) {
    const [data, loading, err] = useCollectionDataFirestore(
      queryRef as Query | null | undefined,
      { idField: "id" },
    );
    const dbError: DbError | null = err ? normalizeFirestoreError(err) : null;
    return [data ?? [], loading, dbError];
  },

  useDocumentData(ref: unknown) {
    const [data, loading, err] = useDocumentDataFirestore(
      ref as DocumentReference | null | undefined,
      { idField: "id" },
    );
    const dbError: DbError | null = err ? normalizeFirestoreError(err) : null;
    return [data, loading, dbError];
  },

  usePendingSync() {
    // Cloud is the source of truth - no pending local writes to track.
    return false;
  },

  async exportAll() {
    // Export from local IDB (mirrors what Drive sync does today).
    // A future migrateToMode utility should use Firestore getDocs per collection instead.
    const db = await getDb();
    const result: Record<string, unknown[]> = {};
    for (const store of STORES) {
      result[store] = await db.getAll(store);
    }
    return result;
  },
};
