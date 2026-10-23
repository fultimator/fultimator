export const IS_ELECTRON: boolean =
  (import.meta.env as Record<string, string>)["VITE_TARGET"] === "electron";

/**
 * True when running inside a Capacitor native shell (Android/iOS). Detected at
 * runtime because the same web bundle is loaded both in a browser and in the
 * native WebView; there is no build-time flag.
 */
export const IS_CAPACITOR: boolean =
  typeof window !== "undefined" &&
  (
    window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
  ).Capacitor?.isNativePlatform?.() === true;

/** True on all platforms - IndexedDB is available in every modern browser and in Electron. */
export const SUPPORTS_LOCAL_DB: boolean = true;
