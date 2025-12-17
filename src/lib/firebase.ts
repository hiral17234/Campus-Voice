import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgP-GYtd79kluh3k3qrWU1GwbstMo-_ds",
  authDomain: "campusvoice-75ca6.firebaseapp.com",
  projectId: "campusvoice-75ca6",
  storageBucket: "campusvoice-75ca6.firebasestorage.app",
  messagingSenderId: "615993795590",
  appId: "1:615993795590:web:6fdd5dd6e07c4b1c82cf87",
  measurementId: "G-935DMTQDQW"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
