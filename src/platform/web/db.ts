// Web platform adapter - thin re-exports of Firebase + react-firebase-hooks.
// Imported via the @platform alias when building for web.

export { firestore, auth, googleAuthProvider } from "../../firebase";

export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";

export {
  signInWithPopup,
  signOut,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
export type { User, UserCredential } from "firebase/auth";

export {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
export { useAuthState } from "react-firebase-hooks/auth";

export { syncToDrive, restoreFromDrive, checkDriveAuth, loginDrive, storeAccessToken } from "./drive";
export { usePendingSync } from "../idb";
