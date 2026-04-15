import { useState, useEffect, useMemo, type ReactNode } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";
import { IS_ELECTRON } from "../platform";
import { CloudAdapter } from "../adapters/CloudAdapter";
import { LocalAdapter } from "../adapters/LocalAdapter";
import {
  DatabaseContext,
  type DatabaseContextValue,
} from "./useDatabaseContext";
import type { DbMode } from "../types/Database";

const DB_MODE_KEY = "fultimator_db_mode";

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [dbMode, setDbModeState] = useState<DbMode>(() => {
    try {
      const stored = localStorage.getItem(DB_MODE_KEY);
      if (stored === "cloud" || stored === "local") return stored;
    } catch {
      // localStorage not available
    }
    return IS_ELECTRON ? "local" : "cloud";
  });

  const [cloudUser, setCloudUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCloudUser(user);
      setAuthLoading(false);
    });
  }, []);

  const setDbMode = (mode: DbMode) => {
    try {
      localStorage.setItem(DB_MODE_KEY, mode);
    } catch {
      // localStorage not available
    }
    setDbModeState(mode);
  };

  const requestModeSwitch = (mode: DbMode) => {
    if (mode === dbMode) return;
    setDbMode(mode);
  };

  // Both adapters are always instantiated - stable references for the lifetime of the app.
  const cloudAdapter = useMemo(() => CloudAdapter, []);
  const localAdapter = useMemo(() => LocalAdapter, []);

  const activeAdapter = dbMode === "cloud" ? cloudAdapter : localAdapter;
  const activeUid =
    dbMode === "cloud" && cloudUser ? cloudUser.uid : "local-user";

  const value = useMemo<DatabaseContextValue>(
    () => ({
      dbMode,
      setDbMode,
      requestModeSwitch,
      cloudUser,
      authLoading,
      activeUid,
      cloudAdapter,
      localAdapter,
      activeAdapter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbMode, cloudUser, authLoading, activeUid, activeAdapter],
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
