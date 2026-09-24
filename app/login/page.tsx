"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Home,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithEmail, registerWithEmail, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const isFirebaseError = (e: unknown): e is { code: string; message: string } =>
        typeof e === "object" && e !== null && "code" in e && "message" in e;
      let msg = isFirebaseError(err)
        ? err.message
        : "Failed to authenticate. Please check your credentials.";
      if (isFirebaseError(err)) {
        if (err.code === "auth/invalid-credential") {
          msg = "Invalid email or password. You can also use 'Continue as Guest' below.";
        } else if (err.code === "auth/email-already-in-use") {
          msg = "This email is already registered. Please switch to Sign In.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#1F040F] relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
      {/* 3D Ambient Glowing Mesh Background */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FC6C26]/20 rounded-full blur-[120px] pointer-events-none animate-mesh-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#480E28]/50 rounded-full blur-[130px] pointer-events-none animate-mesh-float" style={{ animationDelay: "-6s" }} />

      {/* Top Header Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2D0818]/80 text-[#FFF8DF] hover:text-[#FC6C26] border border-[#FC6C26]/30 text-xs font-semibold backdrop-blur-md transition-colors shadow-sm"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-md my-8">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FC6C26] to-[#480E28] p-0.5 shadow-xl shadow-[#FC6C26]/20 mb-3 animate-pulse-glow">
            <div className="w-full h-full bg-[#1F040F] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#FC6C26]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FFF8DF] tracking-tight">
            ClauseGuard Access
          </h1>
          <p className="text-xs text-[#FFF8DF]/70 mt-1">
            Sign in to unlock AI contract auditing and attorney intake preparation
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#FFFDF5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#FC6C26]/30 relative overflow-hidden">
          {/* Subtle Top Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FC6C26] via-[#68173B] to-[#FC6C26]" />

          {/* Mode Tabs */}
          <div className="flex bg-[#FFF8DF] p-1 rounded-xl mb-6 border border-[#FC6C26]/20">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-[#2D0818] text-[#FFF8DF] shadow-md shadow-[#2D0818]/20"
                  : "text-[#18030B]/70 hover:text-[#18030B]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-[#2D0818] text-[#FFF8DF] shadow-md shadow-[#2D0818]/20"
                  : "text-[#18030B]/70 hover:text-[#18030B]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#18030B] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FC6C26]/30 rounded-xl text-xs sm:text-sm text-[#18030B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FC6C26] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18030B] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#FC6C26]/30 rounded-xl text-xs sm:text-sm text-[#18030B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FC6C26] focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#FFF8DF] bg-gradient-to-r from-[#2D0818] via-[#480E28] to-[#2D0818] hover:from-[#FC6C26] hover:to-[#FC6C26] hover:text-[#1F040F] transition-all duration-300 shadow-lg shadow-[#2D0818]/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#FFF8DF]/40 border-t-[#FFF8DF] rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to Workspace" : "Create My Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#FC6C26]/20" />
            </div>
            <span className="relative px-3 bg-[#FFFDF5] text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Or Fast Track
            </span>
          </div>

          {/* Instant Guest / Demo Mode Button */}
          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#2D0818] bg-[#FFF8DF] hover:bg-[#FFE8B6] border border-[#FC6C26]/40 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-[#FC6C26]" />
            <span>Explore as Guest / Evaluator Mode</span>
          </button>

          <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed">
            *Evaluator notice: Guest mode enables full access to risk auditing, presets, redlines, and attorney dossier exports immediately without signup.
          </p>
        </div>

        {/* Security & Confidentiality Tag */}
        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-[11px] text-[#FFF8DF]/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#FC6C26]" />
          <span>Zero Server-Side Persistence • Client-Side Confidentiality</span>
        </div>
      </div>
    </div>
  );
}
