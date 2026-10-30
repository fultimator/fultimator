// Shared database types used by adapters, the hook, and the context.

export type DbMode = "cloud" | "local";

export type DbErrorCode =
  | "quota-exceeded" // Cloud only: Firebase free-tier limit hit
  | "permission-denied" // Cloud only: Firestore security rules rejected the op
  | "not-found" // Document does not exist (both adapters)
  | "unavailable" // Cloud only: network unreachable
  | "unknown"; // Catch-all

export interface DbError {
  code: DbErrorCode;
  message: string;
  raw?: unknown;
}

// Supported `where` operators - both adapters MUST support all of these.
// Do not use Firebase operators not in this list (e.g., array-contains-any)
// without first implementing support in the local adapter.
export type WhereOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "in";

export interface WriteBatch {
  set: (ref: unknown, data: unknown) => void;
  delete: (ref: unknown) => void;
  commit: () => Promise<void>;
}

export interface DatabaseAdapter {
  // Reference builders
  collection: (path: string) => unknown;
  doc: (path: string, id: string) => unknown;
  query: (ref: unknown, ...constraints: unknown[]) => unknown;

  // Query constraints
  where: (field: string, op: WhereOp, value: unknown) => unknown;
  orderBy: (field: string, direction?: "asc" | "desc") => unknown;
  limit: (n: number) => unknown;
  startAfter: (snapshot: unknown) => unknown;

  // One-time reads (non-reactive)
  getDoc: (ref: unknown) => Promise<unknown | null>;
  getDocs: (query: unknown) => Promise<unknown[]>;

  // Writes
  addDoc: (
    ref: unknown,
    data: Record<string, unknown>,
  ) => Promise<{ id: string }>;
  setDoc: (ref: unknown, data: Record<string, unknown>) => Promise<void>;
  deleteDoc: (ref: unknown) => Promise<void>;
  writeBatch: () => WriteBatch;

  // Reactive hooks
  useCollectionData: (query: unknown) => [unknown[], boolean, DbError | null];
  useDocumentData: (ref: unknown) => [unknown, boolean, DbError | null];

  // Sync state
  usePendingSync: () => boolean;

  // Full export for Drive sync / mode migration
  exportAll: () => Promise<Record<string, unknown[]>>;
}

// Collections where the active cloud uid is auto-injected as a where filter.
// Local adapter never uses uid filtering - IDB is per-device.
export const USER_SCOPED_COLLECTIONS = new Set([
  "npc-personal",
  "player-personal",
  "encounters",
  "rolls",
  "rolls-prepared",
]);
