"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Safe storage accessors that never throw in private browsing, SSR, or iframes
function safeGetStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or access denial
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

function isDevOrDemoKeyError(err: unknown): boolean {
  const code = String((err as any)?.code || "").toLowerCase();
  const msg = String((err as any)?.message || "").toLowerCase();
  return (
    code.includes("api-key-not-valid") ||
    code.includes("invalid-api-key") ||
    code.includes("network-request-failed") ||
    code.includes("app-deleted") ||
    msg.includes("api-key-not-valid") ||
    msg.includes("api key not valid") ||
    msg.includes("please-pass-a-valid-api-key") ||
    msg.includes("pass a valid api key")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if guest or simulated local session exists in localStorage
    const savedGuest = safeGetStorage("clauseguard_guest_session");
    const savedUserJson = safeGetStorage("clauseguard_local_user");

    if (savedUserJson) {
      try {
        const parsed = JSON.parse(savedUserJson);
        setUser(parsed as unknown as User);
        setIsGuest(false);
        setLoading(false);
        return;
      } catch {
        safeRemoveStorage("clauseguard_local_user");
      }
    }

    if (savedGuest === "true") {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    if (!auth) {
      console.warn("Firebase Auth instance not initialized. Operating in resilient local auth mode.");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setIsGuest(false);
          safeRemoveStorage("clauseguard_guest_session");
          safeRemoveStorage("clauseguard_local_user");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Auth listener error, falling back gracefully:", err);
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      // Local session mode
      const localUser = {
        email,
        uid: "user_" + Math.random().toString(36).substring(2, 9),
        displayName: email.split("@")[0],
      } as unknown as User;
      setUser(localUser);
      setIsGuest(false);
      safeSetStorage("clauseguard_local_user", JSON.stringify(localUser));
      safeRemoveStorage("clauseguard_guest_session");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsGuest(false);
      safeRemoveStorage("clauseguard_guest_session");
      safeRemoveStorage("clauseguard_local_user");
    } catch (error: unknown) {
      if (isDevOrDemoKeyError(error)) {
        console.warn("Firebase API key not linked yet. Creating local authenticated session for:", email);
        const localUser = {
          email,
          uid: "user_" + Math.random().toString(36).substring(2, 9),
          displayName: email.split("@")[0],
        } as unknown as User;

        setUser(localUser);
        setIsGuest(false);
        safeSetStorage("clauseguard_local_user", JSON.stringify(localUser));
        safeRemoveStorage("clauseguard_guest_session");
        return;
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      // Local session mode
      const localUser = {
        email,
        uid: "user_" + Math.random().toString(36).substring(2, 9),
        displayName: email.split("@")[0],
      } as unknown as User;
      setUser(localUser);
      setIsGuest(false);
      safeSetStorage("clauseguard_local_user", JSON.stringify(localUser));
      safeRemoveStorage("clauseguard_guest_session");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setIsGuest(false);
      safeRemoveStorage("clauseguard_guest_session");
      safeRemoveStorage("clauseguard_local_user");
    } catch (error: unknown) {
      if (isDevOrDemoKeyError(error)) {
        console.warn("Firebase API key not linked yet. Registering local session for:", email);
        const localUser = {
          email,
          uid: "user_" + Math.random().toString(36).substring(2, 9),
          displayName: email.split("@")[0],
        } as unknown as User;

        setUser(localUser);
        setIsGuest(false);
        safeSetStorage("clauseguard_local_user", JSON.stringify(localUser));
        safeRemoveStorage("clauseguard_guest_session");
        return;
      }
      throw error;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    safeSetStorage("clauseguard_guest_session", "true");
    safeRemoveStorage("clauseguard_local_user");
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut fallback:", e);
      }
    }
    setUser(null);
    setIsGuest(false);
    safeRemoveStorage("clauseguard_guest_session");
    safeRemoveStorage("clauseguard_local_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        loading,
        loginWithEmail,
        registerWithEmail,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
