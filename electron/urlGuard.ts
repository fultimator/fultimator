import { shell } from "electron";

const ALLOWED_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

export function isSafeExternalUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function safeOpenExternal(url: unknown): Promise<void> {
  if (isSafeExternalUrl(url)) return shell.openExternal(url);
  console.warn("[security] Blocked openExternal for unsafe URL:", url);
  return Promise.resolve();
}
