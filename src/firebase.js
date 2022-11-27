// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAL0PZFyFcTg5OG7LE0wvBWGcpu1hsJ_Ro",
  authDomain: "fabula-ultima-helper.firebaseapp.com",
  projectId: "fabula-ultima-helper",
  storageBucket: "fabula-ultima-helper.appspot.com",
  messagingSenderId: "384266567864",
  appId: "1:384266567864:web:3f56d8d7557cac54aef44d",
  measurementId: "G-PN5NS6ZV35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
