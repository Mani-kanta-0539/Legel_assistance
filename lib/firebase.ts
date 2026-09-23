import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCyM2PR1lUwPvvFVFehu5MyZ-bxMR3DQ3g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "promptwars-62d1a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwars-62d1a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "promptwars-62d1a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "926956522761",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:926956522761:web:89a23d11df340ca88f97d8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZHBXW6JFE8",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

try {
  if (typeof window !== "undefined" || process.env.NODE_ENV !== "test") {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (error) {
  console.warn("Firebase client initialization warning (safe fallback):", error);
}

export { app, auth };
export default app;
