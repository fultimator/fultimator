import { createContext, useContext } from "react";
import type { DatabaseAdapter, DbMode } from "../types/Database";
import type { User as FirebaseUser } from "firebase/auth";

export interface DatabaseContextValue {
  dbMode: DbMode;
  setDbMode: (mode: DbMode) => void;
  requestModeSwitch: (mode: DbMode) => void;
  cloudUser: FirebaseUser | null;
  authLoading: boolean;
  activeUid: string;
  cloudAdapter: DatabaseAdapter;
  localAdapter: DatabaseAdapter;
  activeAdapter: DatabaseAdapter;
}

export const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function useDatabaseContext(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx)
    throw new Error("useDatabaseContext must be used inside DatabaseProvider");
  return ctx;
}
