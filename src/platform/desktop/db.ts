// Desktop platform adapter - IndexedDB-backed implementation of the Firestore-compatible API.
// Imported via the @platform alias when building for Electron.
// Reference types
import { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
// Import from firebase.js so initializeApp() runs before getAuth() is called
import { auth as _initializedAuth } from "../../firebase";
// Firestore-compatible API
import {
  getDb,
  STORES,
  notifyListeners,
  subscribeToStore,
  notifyAllListeners,
  clearPendingSync,
  usePendingSync,
} from "../idb";
// Filter/sort helpers
// Re-export for consumers that import getDb/STORES directly (e.g. DriveSync)
export { getDb, STORES, notifyListeners, notifyAllListeners, usePendingSync };
// React hooks
// Auth - real Firebase auth
export interface CollectionRef {
  _type: "collection";
  path: string;
  storeName: string;
}
// Auto-bootstrap: silently sign into Firebase if Drive tokens already exist
export interface DocRef {
  _type: "doc";
  path: string;
  id: string;
  storeName: string;
}

export interface WhereConstraint {
  _type: "where";
  field: string;
  op: string;
  value: unknown;
}

export interface OrderByConstraint {
  _type: "orderBy";
  field: string;
  direction: "asc" | "desc";
}

export interface LimitConstraint {
  _type: "limit";
  n: number;
}

export interface StartAfterConstraint {
  _type: "startAfter";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  snapshot: any;
}

export interface QueryRef {
  _type: "query";
  collection: CollectionRef;
  constraints: (
    | WhereConstraint
    | OrderByConstraint
    | LimitConstraint
    | StartAfterConstraint
  )[];
}

export function collection(
  _db: unknown,
  ...pathSegments: string[]
): CollectionRef {
  const path = pathSegments.join("/");
  const storeName = pathSegments[pathSegments.length - 1];
  return { _type: "collection", path, storeName };
}

export function doc(_db: unknown, ...pathSegments: string[]): DocRef {
  const id = pathSegments[pathSegments.length - 1];
  const collectionSegments = pathSegments.slice(0, -1);
  const storeName = collectionSegments[collectionSegments.length - 1];
  const path = pathSegments.join("/");
  return { _type: "doc", path, id, storeName };
}

export function where(
  field: string,
  op: string,
  value: unknown,
): WhereConstraint {
  return { _type: "where", field, op, value };
}

export function orderBy(
  field: string,
  direction: "asc" | "desc" = "asc",
): OrderByConstraint {
  return { _type: "orderBy", field, direction };
}

export function limit(n: number): LimitConstraint {
  return { _type: "limit", n };
}

export function startAfter(snapshot: unknown): StartAfterConstraint {
  return { _type: "startAfter", snapshot };
}

export function query(
  ref: CollectionRef,
  ...constraints: (
    | WhereConstraint
    | OrderByConstraint
    | LimitConstraint
    | StartAfterConstraint
  )[]
): QueryRef {
  return { _type: "query", collection: ref, constraints };
}

export async function addDoc(
  ref: CollectionRef,
  data: Record<string, unknown>,
): Promise<{ id: string }> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const record = { ...data, id };
  await db.put(ref.storeName, record);
  notifyListeners(ref.storeName);
  return { id };
}

export async function setDoc(
  ref: DocRef,
  data: Record<string, unknown>,
): Promise<void> {
  const db = await getDb();
  await db.put(ref.storeName, { ...data, id: ref.id });
  notifyListeners(ref.storeName);
}

export async function deleteDoc(ref: DocRef): Promise<void> {
  const db = await getDb();
  await db.delete(ref.storeName, ref.id);
  notifyListeners(ref.storeName);
}

export async function getDoc(
  ref: DocRef,
): Promise<{ exists: () => boolean; data: () => unknown; id: string }> {
  const db = await getDb();
  const record = await db.get(ref.storeName, ref.id);
  return {
    exists: () => record !== undefined,
    data: () => record,
    id: ref.id,
  };
}

export async function getDocs(
  ref: CollectionRef | QueryRef,
): Promise<{ docs: Array<{ id: string; data: () => unknown }> }> {
  const db = await getDb();
  const colRef = ref._type === "query" ? ref.collection : ref;
  let records: Record<string, unknown>[] = await db.getAll(colRef.storeName);

  if (ref._type === "query") {
    for (const c of ref.constraints) {
      if (c._type === "where") records = applyWhere(records, c);
    }
    const orderBys = ref.constraints.filter(
      (c): c is OrderByConstraint => c._type === "orderBy",
    );
    if (orderBys.length > 0) records = applyOrderBy(records, orderBys);

    const limitC = ref.constraints.find(
      (c): c is LimitConstraint => c._type === "limit",
    );
    const startAfterC = ref.constraints.find(
      (c): c is StartAfterConstraint => c._type === "startAfter",
    );
    if (startAfterC) {
      const startId = startAfterC.snapshot?.id;
      const idx = records.findIndex((r) => r["id"] === startId);
      if (idx !== -1) records = records.slice(idx + 1);
    }
    if (limitC) records = records.slice(0, limitC.n);
  }

  return {
    docs: records.map((r) => ({ id: r["id"] as string, data: () => r })),
  };
}

// Filter/sort helpers
function applyWhere(
  records: Record<string, unknown>[],
  constraint: WhereConstraint,
): Record<string, unknown>[] {
  return records.filter((r) => {
    const val = r[constraint.field];
    switch (constraint.op) {
      case "==":
        return val === constraint.value;
      case "!=":
        return val !== constraint.value;
      case "<":
        return (val as number) < (constraint.value as number);
      case "<=":
        return (val as number) <= (constraint.value as number);
      case ">":
        return (val as number) > (constraint.value as number);
      case ">=":
        return (val as number) >= (constraint.value as number);
      case "array-contains":
        return Array.isArray(val) && val.includes(constraint.value);
      case "in":
        return (
          Array.isArray(constraint.value) &&
          (constraint.value as unknown[]).includes(val)
        );
      default:
        return true;
    }
  });
}

function applyOrderBy(
  records: Record<string, unknown>[],
  orderBys: OrderByConstraint[],
): Record<string, unknown>[] {
  return [...records].sort((a, b) => {
    for (const ob of orderBys) {
      const av = a[ob.field];
      const bv = b[ob.field];
      if (av === bv) continue;
      const cmp = av == null ? -1 : bv == null ? 1 : av < bv ? -1 : 1;
      return ob.direction === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// React hooks
export function useCollectionData(
  ref: CollectionRef | QueryRef | null | undefined,
): [unknown[], boolean, Error | undefined] {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const refKey = ref
    ? ref._type === "query"
      ? ref.collection.path + JSON.stringify(ref.constraints)
      : ref.path
    : null;
  const storeName = ref
    ? ref._type === "query"
      ? ref.collection.storeName
      : ref.storeName
    : null;

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchData = () => {
      getDocs(ref)
        .then((snapshot) => {
          if (!cancelled) {
            setData(
              snapshot.docs.map((d) => ({ ...(d.data() as object), id: d.id })),
            );
            setLoading(false);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) {
            setError(err);
            setLoading(false);
          }
        });
    };

    setLoading(true);
    fetchData();
    const unsubscribe = storeName
      ? subscribeToStore(storeName, fetchData)
      : undefined;
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refKey]);

  return [data, loading, error];
}

export function useDocumentData(
  ref: DocRef | null | undefined,
): [unknown, boolean, Error | undefined] {
  const [data, setData] = useState<unknown>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const refKey = ref ? ref.path : null;
  const storeName = ref ? ref.storeName : null;

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchData = () => {
      getDoc(ref)
        .then((snapshot) => {
          if (!cancelled) {
            setData(snapshot.exists() ? snapshot.data() : undefined);
            setLoading(false);
          }
        })
        .catch((err: Error) => {
          if (!cancelled) {
            setError(err);
            setLoading(false);
          }
        });
    };

    setLoading(true);
    fetchData();
    const unsubscribe = storeName
      ? subscribeToStore(storeName, fetchData)
      : undefined;
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refKey]);

  return [data, loading, error];
}

// Auth - real Firebase auth
export const auth = _initializedAuth;
export const googleAuthProvider = new GoogleAuthProvider();
export function getAuth() {
  return _initializedAuth;
}
export type User = FirebaseUser;
export type UserCredential = { user: FirebaseUser };

export function useAuthState(
  _authArg?: unknown,
): [FirebaseUser | null, boolean, undefined] {
  // undefined = still resolving, null = signed out, FirebaseUser = signed in
  const [user, setUser] = useState<FirebaseUser | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);
  const loading = user === undefined;
  return [loading ? null : user, loading, undefined];
}

/**
 * On desktop, sign-in triggers the native Google Drive OAuth flow via IPC,
 * then uses the returned id_token to sign into Firebase - one login for both.
 * The _authArg and _provider params match the Firebase signInWithPopup signature
 * so the existing SignIn component works without changes.
 */
export async function signInWithPopup(
  _authArg?: unknown,
  _provider?: unknown,
): Promise<void> {
  const ipc = (
    window as Window & {
      ipcRenderer?: {
        invoke: (ch: string, ...a: unknown[]) => Promise<unknown>;
      };
    }
  ).ipcRenderer;
  if (!ipc) throw new Error("IPC not available");
  await ipc.invoke("login-google");
  const { idToken, accessToken } = (await ipc.invoke("get-google-tokens")) as {
    idToken: string;
    accessToken: string;
  };
  if (!idToken) throw new Error("Google sign-in did not return an id_token");
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  const ipc = (
    window as Window & {
      ipcRenderer?: { invoke: (ch: string) => Promise<unknown> };
    }
  ).ipcRenderer;
  await ipc?.invoke("logoutGoogle");
}

export { onAuthStateChanged };

if (typeof window !== "undefined") {
  const ipc = (
    window as Window & {
      ipcRenderer?: { invoke: (ch: string) => Promise<unknown> };
    }
  ).ipcRenderer;
  if (ipc) {
    ipc
      .invoke("check-auth")
      .then(async (result) => {
        const { isAuthenticated } = result as { isAuthenticated: boolean };
        if (!isAuthenticated) return;
        const { idToken, accessToken } = (await ipc.invoke(
          "get-google-tokens",
        )) as { idToken: string | null; accessToken: string | null };
        if (!idToken) return;
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
      })
      .catch((e) =>
        console.warn("[desktop] Firebase auto-bootstrap failed:", e),
      );
  }
}

// firestore stub - first arg to collection()/doc(), ignored on desktop
export const firestore = null;

// Web Drive token stub (no-op on desktop - token management is handled via IPC)
export function storeAccessToken(_token: string): void {}

// Drive sync
export async function syncToDrive(): Promise<void> {
  const ipc = (
    window as Window & {
      ipcRenderer?: {
        invoke: (ch: string, ...a: unknown[]) => Promise<unknown>;
      };
    }
  ).ipcRenderer;
  if (!ipc) throw new Error("IPC not available");
  const db = await getDb();
  const snapshot: Record<string, unknown[]> = {};
  for (const store of STORES) {
    snapshot[store] = await db.getAll(store);
  }
  const buffer = new TextEncoder().encode(JSON.stringify(snapshot)).buffer;
  await ipc.invoke(
    "upload-buffer-to-google-drive",
    buffer,
    "fultimatordb.json",
  );
  clearPendingSync();
}

export async function restoreFromDrive(): Promise<void> {
  const ipc = (
    window as Window & {
      ipcRenderer?: {
        invoke: (ch: string, ...a: unknown[]) => Promise<unknown>;
      };
    }
  ).ipcRenderer;
  if (!ipc) throw new Error("IPC not available");

  // List Drive files, pick the backup
  const files = (await ipc.invoke("list-files")) as Array<{
    id: string;
    name: string;
  }>;
  const file = files.find((f) => f.name === "fultimatordb.json");
  if (!file) throw new Error("No fultimatordb.json found in Google Drive");

  const filePath = (await ipc.invoke(
    "download-from-google-drive",
    file.id,
  )) as string;
  const raw = (await ipc.invoke("read-file", filePath)) as string;
  const snapshot = JSON.parse(raw) as Record<string, unknown[]>;

  const db = await getDb();
  for (const [storeName, records] of Object.entries(snapshot)) {
    if (!(STORES as readonly string[]).includes(storeName)) continue;
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.clear();
    for (const record of records) await tx.store.put(record);
    await tx.done;
    notifyListeners(storeName);
  }
  clearPendingSync();
}

type IPC = { invoke: (ch: string, ...a: unknown[]) => Promise<unknown> };
function getIpc(): IPC | undefined {
  return (window as Window & { ipcRenderer?: IPC }).ipcRenderer;
}

/** Returns true if the user has an active Google Drive session on desktop. */
export async function checkDriveAuth(): Promise<boolean> {
  const result = (await getIpc()?.invoke("check-auth")) as
    | { isAuthenticated: boolean }
    | undefined;
  return result?.isAuthenticated ?? false;
}

/** Triggers the Google Drive OAuth login flow on desktop. */
export async function loginDrive(): Promise<void> {
  const ipc = getIpc();
  if (!ipc) throw new Error("IPC not available");
  await ipc.invoke("login-google");
  // Also sign into Firebase with the new tokens
  const { idToken, accessToken } = (await ipc.invoke("get-google-tokens")) as {
    idToken: string;
    accessToken: string;
  };
  if (idToken) {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    await signInWithCredential(auth, credential);
  }
}
