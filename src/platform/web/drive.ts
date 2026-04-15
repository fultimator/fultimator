// Web platform - Google Drive sync.
// Drive access is piggybacked on the Firebase Google sign-in: googleAuthProvider
// includes the drive.file scope, so the same OAuth access token covers both.
// No separate GIS library needed.

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleAuthProvider } from "../../firebase";
import { getDb, STORES, notifyAllListeners, clearPendingSync } from "../idb";

export const DRIVE_TOKEN_KEY = "fultimator_drive_token";

function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(DRIVE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeAccessToken(token: string): void {
  try {
    sessionStorage.setItem(DRIVE_TOKEN_KEY, token);
  } catch {
    // sessionStorage not available
  }
}

/** Re-sign-in with Google to obtain a fresh access token (includes drive.file scope). */
async function requestFreshToken(): Promise<string> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken)
    throw new Error("Google sign-in did not return an access token");
  storeAccessToken(credential.accessToken);
  return credential.accessToken;
}

async function getOrRequestToken(): Promise<string> {
  return getStoredToken() ?? requestFreshToken();
}

const BACKUP_FILE_NAME = "fultimatordb.json";

async function findBackupFile(token: string): Promise<string | null> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D'${BACKUP_FILE_NAME}'%20and%20trashed%3Dfalse&spaces=drive&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  const { files } = (await res.json()) as { files: Array<{ id: string }> };
  return files?.[0]?.id ?? null;
}

async function uploadContent(
  token: string,
  content: string,
  existingId: string | null,
): Promise<void> {
  const boundary = "fultimator_mp_boundary";
  const metadata = JSON.stringify({
    name: BACKUP_FILE_NAME,
    mimeType: "application/json",
  });
  const body =
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n` +
    `--${boundary}--`;

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  const method = existingId ? "PATCH" : "POST";

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
}

/** Returns true if the user is signed into Firebase and we have a Drive access token. */
export function checkDriveAuth(): Promise<boolean> {
  return Promise.resolve(
    auth.currentUser !== null && getStoredToken() !== null,
  );
}

/** Sign in with Google (or re-sign-in) to obtain a Drive access token. */
export async function loginDrive(): Promise<void> {
  await requestFreshToken();
}

/** Upload the full IndexedDB state to Google Drive as fultimatordb.json. */
export async function syncToDrive(): Promise<void> {
  const token = await getOrRequestToken();
  const db = await getDb();
  const snapshot: Record<string, unknown[]> = {};
  for (const store of STORES) {
    snapshot[store] = await db.getAll(store);
  }
  const existingId = await findBackupFile(token);
  await uploadContent(token, JSON.stringify(snapshot), existingId);
  clearPendingSync();
}

/** Download fultimatordb.json from Drive and restore it into IndexedDB. */
export async function restoreFromDrive(): Promise<void> {
  const token = await getOrRequestToken();
  const fileId = await findBackupFile(token);
  if (!fileId) throw new Error("No backup found in Google Drive");

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  const snapshot = (await res.json()) as Record<string, unknown[]>;

  const db = await getDb();
  for (const [storeName, records] of Object.entries(snapshot)) {
    if (!(STORES as readonly string[]).includes(storeName)) continue;
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.clear();
    for (const record of records) await tx.store.put(record);
    await tx.done;
  }
  notifyAllListeners();
  clearPendingSync();
}
