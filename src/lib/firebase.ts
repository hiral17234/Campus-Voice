import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBgP-GYtd79kluh3k3qrWU1GwbstMo-_ds",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campusvoice-75ca6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campusvoice-75ca6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campusvoice-75ca6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "615993795590",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:615993795590:web:6fdd5dd6e07c4b1c82cf87",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-935DMTQDQW",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
