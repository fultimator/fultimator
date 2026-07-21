import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";
import { storeAccessToken } from "./platform/web/drive";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export async function signInWithGoogleNative(withDriveScope = false) {
  const result = await FirebaseAuthentication.signInWithGoogle(
    withDriveScope ? { scopes: [DRIVE_SCOPE] } : undefined,
  );
  const idToken = result.credential?.idToken;
  if (!idToken) {
    throw new Error("Native Google sign-in did not return an idToken");
  }
  if (withDriveScope && result.credential?.accessToken) {
    storeAccessToken(result.credential.accessToken);
  }
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function loginDriveNative(): Promise<void> {
  await signInWithGoogleNative(true);
}

export async function signOutNative(): Promise<void> {
  await FirebaseAuthentication.signOut();
}
