// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0cC_pOHaDjG14qJFj97LNKDdlIRR1boc",
  authDomain: "fultimator.firebaseapp.com",
  projectId: "fultimator",
  storageBucket: "fultimator.appspot.com",
  messagingSenderId: "980964047050",
  appId: "1:980964047050:web:e438942af588a97064dc33",
  measurementId: "G-E37Q3Z19TE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
