"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContractInput } from "@/components/ContractInput";
import { RiskScorecard } from "@/components/RiskScorecard";
import { ClauseList } from "@/components/ClauseList";
import { ContractCompare } from "@/components/ContractCompare";
import { CounterProposalModal } from "@/components/CounterProposalModal";
import { IntakeDossierModal } from "@/components/IntakeDossierModal";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { AuditIntentModal } from "@/components/AuditIntentModal";
import { StatutoryGroundingCard } from "@/components/StatutoryGroundingCard";
import { LegalChatbot } from "@/components/LegalChatbot";
import { ContractAuditReport, ClauseAudit, UserIntent } from "@/types";
import {
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isGuest, loading, continueAsGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<"audit" | "compare">("audit");
  // Clean empty input slate initially - no pre-filling sample text!
  const [contractText, setContractText] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [report, setReport] = useState<ContractAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sanitizerWarnings, setSanitizerWarnings] = useState<string[]>([]);
  const [auditMeta, setAuditMeta] = useState<{
    source?: string;
    model_used?: string;
    latency_ms?: number;
  } | null>(null);

  // Modals state
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [selectedClauseForProposal, setSelectedClauseForProposal] =
    useState<ClauseAudit | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !user && !isGuest) {
      router.push("/login");
    }
  }, [user, isGuest, loading, router]);

  // Load API key from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("clauseguard_gemini_key") || "";
    setApiKey(saved);

    // Check if an audit was selected to reopen from the Profile page
    const activeAuditJson = localStorage.getItem("clauseguard_active_audit");
    if (activeAuditJson) {
      try {
        const loadedReport = JSON.parse(activeAuditJson);
        setReport(loadedReport);
        localStorage.removeItem("clauseguard_active_audit");
      } catch (e) {
        console.warn("Failed to load active audit:", e);
      }
    }
  }, []);

  const saveAuditToHistory = (auditReport: ContractAuditReport) => {
    try {
      const existing = localStorage.getItem("clauseguard_audit_history");
      const list = existing ? JSON.parse(existing) : [];
      const newEntry = {
        id: "audit_" + Date.now(),
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        report: auditReport,
      };
      // Keep most recent 25 audits
      const updated = [newEntry, ...list.filter((item: { report: { document_title: string } }) => item.report.document_title !== auditReport.document_title)].slice(0, 25);
      localStorage.setItem("clauseguard_audit_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save audit history:", e);
    }
  };

  const executeAudit = async (userIntent?: UserIntent) => {
    if (!contractText.trim()) return;

    setIsIntentModalOpen(false);
    setIsLoading(true);
    setErrorMsg(null);
    setSanitizerWarnings([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractText,
          apiKey,
          userIntent,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze contract");
      }

      setReport(json.report);
      setAuditMeta({
        source: json.source,
        model_used: json.model_used,
        latency_ms: json.latency_ms,
      });
      saveAuditToHistory(json.report);

      if (json.sanitizerWarnings && json.sanitizerWarnings.length > 0) {
        setSanitizerWarnings(json.sanitizerWarnings);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred during analysis.";
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8DF] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#2D0818]/20 border-t-[#FC6C26] rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-[#2D0818]">Loading ClauseGuard Workspace...</p>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-[#1F040F] text-[#FFF8DF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FC6C26] text-[#1F040F] flex items-center justify-center font-bold mb-4 shadow-lg shadow-[#FC6C26]/25 animate-bounce">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-[#FFF8DF] mb-2">Accessing ClauseGuard Workspace</h2>
        <p className="text-xs text-[#FFF8DF]/70 mb-5 max-w-sm">
          Please sign in or continue as guest to review contracts and access the analysis tools.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2.5 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] font-black text-xs shadow-lg transition-all"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => {
              continueAsGuest();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#2D0818] hover:bg-[#3B0D24] text-[#FFF8DF] font-bold text-xs border border-[#FC6C26]/30 transition-all"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FFF8DF] text-[#18030B]">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1F040F] via-[#3B0D24] to-[#1F040F] text-[#FFF8DF] shadow-2xl relative overflow-hidden border border-[#FC6C26]/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FC6C26]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FC6C26]/20 text-[#FC6C26] text-xs font-bold mb-3 border border-[#FC6C26]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Contract Risk & Intake Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Audit Clauses, Generate Redlines & Prepare Legal Briefs
            </h2>
            <p className="text-xs sm:text-sm text-[#FFF8DF]/80 mt-2 leading-relaxed">
              Powered by Google Gemini GenAI. Upload your contract document or select a test preset below to detect predatory traps, generate balanced counter-clauses, and export 1-page attorney dossiers.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#FFF8DF]/90 font-medium">
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#FC6C26]" />
                Verbatim Span Grounding
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Prompt Injection Immune
              </span>
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-300" />
                Statutory Citations & Top 5 Lawyer Questions
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: Single Contract Risk Audit */}
        {activeTab === "audit" && (
          <div>
            {/* Input Section */}
            <ContractInput
              contractText={contractText}
              setContractText={setContractText}
              onRequestAudit={() => setIsIntentModalOpen(true)}
              isLoading={isLoading}
              activePresetId={activePresetId}
              setActivePresetId={setActivePresetId}
            />

            {/* Error Message if any */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sanitizer & Security Warnings Banner */}
            {sanitizerWarnings.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Security & Sanitizer Activity:</span>
                </div>
                {sanitizerWarnings.map((warning, i) => (
                  <p key={i} className="text-amber-800 leading-relaxed">
                    • {warning}
                  </p>
                ))}
              </div>
            )}

            {/* Analysis Results Display */}
            {report && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {auditMeta && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1F040F] via-[#2D0818] to-[#1F040F] border border-[#FC6C26]/40 text-[#FFF8DF] shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${auditMeta.source === "GEMINI_LIVE" ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${auditMeta.source === "GEMINI_LIVE" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#FFF8DF] flex items-center gap-2">
                          <span>
                            {auditMeta.source === "GEMINI_LIVE"
                              ? "Verified Google Gemini Live AI Engine"
                              : "ClauseGuard Deterministic Legal Engine"}
                          </span>
                          {auditMeta.model_used && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FC6C26]/25 border border-[#FC6C26]/40 text-[#FC6C26] text-[11px] font-mono font-bold">
                              {auditMeta.model_used}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#FFF8DF]/70">
                          {auditMeta.source === "GEMINI_LIVE"
                            ? "Contract audited in real-time via Google Generative Language API."
                            : "Deterministic fallback active."}
                        </p>
                      </div>
                    </div>

                    {auditMeta.latency_ms && (
                      <div className="text-right text-xs text-[#FFF8DF]/80 font-mono font-semibold">
                        {(auditMeta.latency_ms / 1000).toFixed(1)}s generation
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Focus & Statutory Grounding (if user selected intent) */}
                {report.custom_focus_analysis && (
                  <StatutoryGroundingCard
                    focusAnalysis={report.custom_focus_analysis}
                  />
                )}

                {/* Scorecard Overview */}
                <RiskScorecard
                  report={report}
                  onOpenDossier={() => setIsDossierOpen(true)}
                />

                {/* Filterable Clause Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#18030B]">
                      Detailed Clause Audit & Redline Generator
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">
                      Showing {report.clauses.length} evaluated provisions
                    </span>
                  </div>

                  <ClauseList
                    clauses={report.clauses}
                    onOpenCounterProposal={(clause) =>
                      setSelectedClauseForProposal(clause)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Two-Document Comparison (Diff Mode) */}
        {activeTab === "compare" && (
          <ContractCompare apiKey={apiKey} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Legal Chatbot */}
      <LegalChatbot
        contractText={contractText}
        reportSummary={report?.document_summary}
      />

      {/* Questionnaire Modal */}
      <AuditIntentModal
        isOpen={isIntentModalOpen}
        onClose={() => setIsIntentModalOpen(false)}
        onSubmit={(intent) => executeAudit(intent)}
        onQuickAudit={() => executeAudit()}
      />

      {/* Counter Proposal Modal */}
      <CounterProposalModal
        clause={selectedClauseForProposal}
        isOpen={Boolean(selectedClauseForProposal)}
        onClose={() => setSelectedClauseForProposal(null)}
      />

      {/* Intake Dossier Modal */}
      {report && (
        <IntakeDossierModal
          report={report}
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={(newKey) => setApiKey(newKey)}
      />
    </div>
  );
}
