export const IS_ELECTRON: boolean =
  (import.meta.env as Record<string, string>)["VITE_TARGET"] === "electron";

/** True on all platforms - IndexedDB is available in every modern browser and in Electron. */
export const SUPPORTS_LOCAL_DB: boolean = true;
