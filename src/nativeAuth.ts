// Native Google sign-in for the Capacitor (Android/iOS) shell.
//
// Firebase's web OAuth (signInWithPopup/signInWithRedirect) does not work inside
// a Capacitor WebView: the __/auth/handler redirect never returns to the
// localhost/capacitor origin. Instead we use the native Google sign-in plugin to
// obtain a Google idToken, then feed that credential into the Firebase JS SDK so
// the rest of the app (auth.currentUser, useAuthState, Firestore rules) is
// unchanged.
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

export async function signInWithGoogleNative() {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result.credential?.idToken;
  if (!idToken) {
    throw new Error("Native Google sign-in did not return an idToken");
  }
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function signOutNative() {
  // Sign out of both the native layer and the JS SDK so state stays consistent.
  await FirebaseAuthentication.signOut();
}
