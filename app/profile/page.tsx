"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContractAuditReport } from "@/types";
import {
  generateAttorneyDossierPdf,
  generateAuditMarkdown,
  triggerBrowserDownload,
} from "@/lib/utils/exporter";
import {
  User,
  Shield,
  Clock,
  Download,
  FileDown,
  Trash2,
  ExternalLink,
  ArrowRight,
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";

export interface SavedAuditEntry {
  id: string;
  timestamp: string;
  report: ContractAuditReport;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isGuest, loading, logout } = useAuth();
  const [history, setHistory] = useState<SavedAuditEntry[]>([]);

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.push("/login");
      return;
    }

    try {
      const saved = localStorage.getItem("clauseguard_audit_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load audit history:", e);
    }
  }, [user, isGuest, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleLoadAudit = (entry: SavedAuditEntry) => {
    localStorage.setItem("clauseguard_active_audit", JSON.stringify(entry.report));
    router.push("/dashboard");
  };

  const handleDeleteEntry = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("clauseguard_audit_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire audit history?")) {
      setHistory([]);
      localStorage.removeItem("clauseguard_audit_history");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8DF] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#2D0818]/20 border-t-[#FC6C26] rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-[#2D0818]">Loading Profile...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-[#1F040F] text-[#FFF8DF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FC6C26] text-[#1F040F] flex items-center justify-center font-bold mb-4 shadow-lg shadow-[#FC6C26]/25 animate-bounce">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-[#FFF8DF] mb-2">Authentication Required</h2>
        <p className="text-xs text-[#FFF8DF]/70 mb-5 max-w-sm">
          Please sign in to view your profile and saved audit history.
        </p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] font-black text-xs shadow-lg transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8DF] text-[#18030B] flex flex-col">
      {/* Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1F040F] via-[#3B0D24] to-[#1F040F] text-[#FFF8DF] shadow-2xl border border-[#FC6C26]/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#FC6C26]/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FC6C26] to-[#68173B] p-0.5 shadow-xl shadow-[#FC6C26]/25 shrink-0">
                <div className="w-full h-full bg-[#1F040F] rounded-[14px] flex items-center justify-center text-[#FC6C26] font-black text-xl">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : "GU"}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-[#FFF8DF]">
                    {user?.email ? user.email : "Guest Evaluator Account"}
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FC6C26]/20 text-[#FC6C26] border border-[#FC6C26]/40 uppercase tracking-wider">
                    {user ? "Firebase Authenticated" : "Evaluator Mode"}
                  </span>
                </div>
                <p className="text-xs text-[#FFF8DF]/70 mt-1">
                  User ID: {user?.uid ? user.uid : "local-evaluator-session"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to Studio</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2D0818] hover:bg-[#480E28] text-[#FFF8DF] border border-[#FC6C26]/30 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audit History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#18030B] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FC6C26]" />
                <span>Your Audit History & Saved Reports</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Saved locally on your device for confidentiality. Reopen any report or download attorney briefs.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((entry) => {
                const { report } = entry;
                const isCritical = report.risk_tier === "CRITICAL" || report.risk_tier === "HIGH";

                return (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-[#FFFDF5] border border-[#FC6C26]/25 shadow-xs hover:border-[#FC6C26]/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCritical
                              ? "bg-red-100 text-red-900 border-red-300"
                              : "bg-emerald-100 text-emerald-900 border-emerald-300"
                          }`}
                        >
                          {report.risk_tier} RISK ({report.overall_risk_score}/100)
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {entry.timestamp}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-[#18030B]">
                        {report.document_title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap pt-1">
                        <span className="text-red-700 font-bold">
                          🔴 {report.summary_stats.red_flags} Predatory
                        </span>
                        <span>•</span>
                        <span className="text-amber-700 font-bold">
                          🟡 {report.summary_stats.amber_flags} Unbalanced
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          🟢 {report.summary_stats.green_flags} Fair
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleLoadAudit(entry)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2D0818] hover:bg-[#3B0D24] text-[#FFF8DF] flex items-center gap-1 shadow-xs transition-colors"
                        title="Reopen and inspect in Studio"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#FC6C26]" />
                        <span>Reopen in Studio</span>
                      </button>

                      <button
                        onClick={() => generateAttorneyDossierPdf(report)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] flex items-center gap-1 shadow-xs transition-colors"
                        title="Download Attorney Dossier PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          const md = generateAuditMarkdown(report);
                          triggerBrowserDownload(
                            md,
                            `${report.document_title.slice(0, 20)}_Audit.md`,
                            "text/markdown;charset=utf-8"
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-[#2D0818] border border-[#FC6C26]/30 flex items-center gap-1 shadow-2xs transition-colors"
                        title="Download Markdown Report"
                      >
                        <FileDown className="w-3.5 h-3.5 text-slate-400" />
                        <span>MD</span>
                      </button>

                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#FFFDF5] border border-[#FC6C26]/25 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-[#FC6C26]/60" />
              <h4 className="text-base font-bold text-[#18030B]">No Audits Recorded Yet</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Once you audit a contract in the studio, your reports, risk scores, and attorney briefing dossiers will automatically appear here.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] transition-all shadow-md mt-2"
              >
                <span>Run Your First Contract Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
