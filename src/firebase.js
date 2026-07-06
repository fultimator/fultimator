// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { IS_ELECTRON } from "./platform";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Enable IndexedDB offline cache - serves reads from local cache after first load
let firestore;
try {
  firestore = initializeFirestore(app, {
    cache: persistentLocalCache(
      IS_ELECTRON ? {} : { tabManager: persistentMultipleTabManager() },
    ),
  });
} catch {
  firestore = getFirestore(app);
}
export { firestore };
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
// Separate provider used only when the user opts into Drive Sync, so a normal
// sign-in does not trigger the Google Drive consent screen.
export const driveAuthProvider = new GoogleAuthProvider();
driveAuthProvider.addScope("https://www.googleapis.com/auth/drive.file");
