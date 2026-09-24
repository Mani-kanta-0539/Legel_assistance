"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Sparkles,
  Sliders,
  GitCompare,
  FileSearch,
  User,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  activeTab?: "audit" | "compare";
  setActiveTab?: (tab: "audit" | "compare") => void;
  onOpenSettings?: () => void;
  hasApiKey?: boolean;
}

export function Header({
  activeTab = "audit",
  setActiveTab,
  onOpenSettings,
  hasApiKey = false,
}: HeaderProps) {
  const { user, isGuest, logout } = useAuth();
  const isLoggedIn = Boolean(user || isGuest);

  const homeHref = isLoggedIn ? "/dashboard" : "/";

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    if (isGuest) {
      return "GU";
    }
    return "CG";
  };

  return (
    <header className="bg-[#1F040F] border-b border-[#FC6C26]/25 text-[#FFF8DF] sticky top-0 z-40 backdrop-blur-md bg-[#1F040F]/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title - links to /dashboard if logged in, otherwise / */}
          <div className="flex items-center gap-3">
            <Link href={homeHref} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FC6C26] to-[#480E28] p-0.5 flex items-center justify-center shadow-lg shadow-[#FC6C26]/20">
                <div className="w-full h-full bg-[#1F040F] rounded-[10px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#FC6C26]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold tracking-tight text-[#FFF8DF] group-hover:text-[#FC6C26] transition-colors">
                    ClauseGuard
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FC6C26]/20 text-[#FC6C26] border border-[#FC6C26]/40">
                    AI Legal Tech
                  </span>
                </div>
                <p className="text-[11px] text-[#FFF8DF]/60 hidden sm:block">
                  Risk Audit & Legal Intake Assistant
                </p>
              </div>
            </Link>
          </div>

          {/* Center Tabs: Audit vs Compare (Only if setActiveTab is passed, i.e., in dashboard) */}
          {setActiveTab && (
            <div
              role="tablist"
              aria-label="Main application view"
              className="flex items-center bg-[#2D0818] p-1 rounded-xl border border-[#FC6C26]/30"
            >
              <button
                role="tab"
                aria-selected={activeTab === "audit"}
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "audit"
                    ? "bg-[#FC6C26] text-[#1F040F] shadow-sm shadow-[#FC6C26]/30"
                    : "text-[#FFF8DF]/80 hover:text-[#FFF8DF] hover:bg-[#3B0D24]"
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Contract Audit</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "compare"}
                onClick={() => setActiveTab("compare")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "compare"
                    ? "bg-[#FC6C26] text-[#1F040F] shadow-sm shadow-[#FC6C26]/30"
                    : "text-[#FFF8DF]/80 hover:text-[#FFF8DF] hover:bg-[#3B0D24]"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Version Diff</span>
              </button>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Engine settings if provided */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2D0818] hover:bg-[#3B0D24] border border-[#FC6C26]/30 text-[#FFF8DF] transition-colors"
                title="Configure AI Engine"
              >
                {hasApiKey ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FC6C26]" />
                    <span className="hidden sm:inline">Gemini Live</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#FC6C26] animate-pulse" />
                    <span className="hidden sm:inline">Gemini Engine</span>
                  </>
                )}
                <Sliders className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            )}

            {/* Profile Avatar / Link */}
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2D0818] hover:bg-[#3B0D24] border border-[#FC6C26]/30 text-[#FFF8DF] transition-colors group"
                title="View Profile & Audit History"
              >
                <div className="w-6 h-6 rounded-full bg-[#FC6C26] text-[#1F040F] font-black text-[10px] flex items-center justify-center">
                  {getUserInitials()}
                </div>
                <span className="text-xs font-bold hidden sm:inline group-hover:text-[#FC6C26]">
                  {user?.email ? user.email.split("@")[0] : "Guest Profile"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
