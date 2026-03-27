import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";
import { IS_ELECTRON } from "../platform";
import { CloudAdapter } from "../adapters/CloudAdapter";
import { LocalAdapter } from "../adapters/LocalAdapter";
import type { DatabaseAdapter, DbMode } from "../types/Database";

const DB_MODE_KEY = "fultimator_db_mode";

interface DatabaseContextValue {
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

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [dbMode, setDbModeState] = useState<DbMode>(() => {
    try {
      const stored = localStorage.getItem(DB_MODE_KEY);
      if (stored === "cloud" || stored === "local") return stored;
    } catch {}
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
    try { localStorage.setItem(DB_MODE_KEY, mode); } catch {}
    setDbModeState(mode);
  };

  const requestModeSwitch = (mode: DbMode) => {
    if (mode === dbMode) return;
    setDbMode(mode);
  };

  // Both adapters are always instantiated - stable references for the lifetime of the app.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cloudAdapter = useMemo(() => CloudAdapter, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localAdapter = useMemo(() => LocalAdapter, []);

  const activeAdapter = dbMode === "cloud" ? cloudAdapter : localAdapter;
  const activeUid = dbMode === "cloud" && cloudUser ? cloudUser.uid : "local-user";

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
    [dbMode, cloudUser, authLoading, activeUid, activeAdapter]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error("useDatabaseContext must be used inside DatabaseProvider");
  return ctx;
}
