"use client";

import React, { useState, useRef } from "react";
import { ContractComparisonReport } from "@/types";
import { COMPARE_PRESETS } from "@/lib/presets/sampleContracts";
import {
  GitCompare,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Sparkles,
  FileDown,
  UploadCloud,
  FileText,
  Trash2,
  X,
  Check,
} from "lucide-react";
import {
  generateComparisonMarkdown,
  triggerBrowserDownload,
} from "@/lib/utils/exporter";

interface ContractCompareProps {
  apiKey: string;
}

export function ContractCompare({ apiKey }: ContractCompareProps) {
  // Clean initial state - no pre-pasted text!
  const [docAName, setDocAName] = useState("");
  const [docAText, setDocAText] = useState("");
  const [docBName, setDocBName] = useState("");
  const [docBText, setDocBText] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // File upload state for Doc A
  const fileInputARef = useRef<HTMLInputElement>(null);
  const [uploadedFileAName, setUploadedFileAName] = useState<string | null>(null);
  const [isDraggingA, setIsDraggingA] = useState(false);

  // File upload state for Doc B
  const fileInputBRef = useRef<HTMLInputElement>(null);
  const [uploadedFileBName, setUploadedFileBName] = useState<string | null>(null);
  const [isDraggingB, setIsDraggingB] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ContractComparisonReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    const p = COMPARE_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setDocAName(p.docA.name);
      setDocAText(p.docA.content);
      setDocBName(p.docB.name);
      setDocBText(p.docB.content);
      setActivePresetId(presetId);
      setUploadedFileAName(null);
      setUploadedFileBName(null);
      setReport(null);
    }
  };

  const processFileA = (file: File) => {
    setUploadedFileAName(file.name);
    if (!docAName) {
      setDocAName(file.name.replace(/\.[^/.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDocAText(content);
        setActivePresetId(null);
      }
    };
    reader.readAsText(file);
  };

  const processFileB = (file: File) => {
    setUploadedFileBName(file.name);
    if (!docBName) {
      setDocBName(file.name.replace(/\.[^/.]+$/, ""));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDocBText(content);
        setActivePresetId(null);
      }
    };
    reader.readAsText(file);
  };

  const handleClearA = () => {
    setDocAName("");
    setDocAText("");
    setUploadedFileAName(null);
    if (fileInputARef.current) fileInputARef.current.value = "";
    setActivePresetId(null);
  };

  const handleClearB = () => {
    setDocBName("");
    setDocBText("");
    setUploadedFileBName(null);
    if (fileInputBRef.current) fileInputBRef.current.value = "";
    setActivePresetId(null);
  };

  const handleClearAll = () => {
    handleClearA();
    handleClearB();
    setReport(null);
    setErrorMsg(null);
  };

  const handleRunCompare = async () => {
    if (!docAText.trim() || !docBText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docAName: docAName.trim() || "Base Draft (Document A)",
          docAText,
          docBName: docBName.trim() || "Revised Draft (Document B)",
          docBText,
          apiKey,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to perform comparison");
      }
      setReport(json.report);
      if (json.model_used) {
        setModelUsed(json.model_used);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during comparison.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;
    const md = generateComparisonMarkdown(report);
    triggerBrowserDownload(md, "ClauseGuard_Contract_Diff_Report.md", "text/markdown;charset=utf-8");
  };

  const handleDownloadJson = () => {
    if (!report) return;
    triggerBrowserDownload(
      JSON.stringify(report, null, 2),
      "ClauseGuard_Contract_Diff_Report.json",
      "application/json;charset=utf-8"
    );
  };

  const hasContent = Boolean(docAText.trim() || docBText.trim());

  return (
    <div className="space-y-6">
      {/* Preset Demo Scenarios */}
      <div className="bg-[#FFFDF5] p-5 rounded-3xl shadow-sm border border-[#FC6C26]/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FC6C26]" />
            Test Comparison Presets (Click to load sample):
          </span>
          {hasContent && (
            <button
              onClick={handleClearAll}
              className="text-[11px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Both Drafts</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {COMPARE_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Load ${p.title} comparison preset`}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
                  isSelected
                    ? "bg-[#2D0818] text-[#FFF8DF] border-[#FC6C26] shadow-md ring-2 ring-[#FC6C26]/40"
                    : "bg-[#FFF8DF] hover:bg-[#FFE8B6] text-[#2D0818] border-[#FC6C26]/30"
                }`}
              >
                <GitCompare className={`w-3.5 h-3.5 ${isSelected ? "text-[#FC6C26]" : "text-[#2D0818]"}`} />
                <span>{p.title}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FC6C26]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Document Input Columns with Upload Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document A (Base Draft) */}
        <div className="bg-[#FFFDF5] rounded-3xl shadow-sm border border-[#FC6C26]/25 p-5 space-y-3.5 flex flex-col">
          {/* Header & Clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D0818]">
                Document A (Original / Base Draft)
              </h4>
            </div>
            {docAText && (
              <button
                onClick={handleClearA}
                aria-label="Clear Document A text"
                className="text-[11px] font-semibold text-slate-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputARef}
            type="file"
            accept=".txt,.md,.doc,.docx"
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFileA(file);
            }}
            className="hidden"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload Base Draft Document A by drag and drop or browse"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputARef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingA(true);
            }}
            onDragLeave={() => setIsDraggingA(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingA(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processFileA(file);
            }}
            onClick={() => fileInputARef.current?.click()}
            className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
              isDraggingA
                ? "bg-[#FFE8B6] border-[#FC6C26] ring-2 ring-[#FC6C26]"
                : "bg-[#FFF8DF] border-[#FC6C26]/30 hover:bg-[#FFEFC7]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FC6C26]/20 text-[#FC6C26] flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D0818]">
                  {uploadedFileAName ? uploadedFileAName : "Upload Base Draft (.txt, .md)"}
                </p>
                <p className="text-[10px] text-slate-600">
                  Click or drag file here to import Document A
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#FC6C26]/30 text-[11px] font-bold text-[#2D0818] shrink-0">
              Browse
            </span>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#2D0818] mb-1">
              Document A Label
            </label>
            <input
              type="text"
              value={docAName}
              onChange={(e) => setDocAName(e.target.value)}
              placeholder="e.g. Original Lease (Draft v1.0)"
              className="w-full px-3.5 py-2 text-xs font-bold text-[#18030B] bg-[#FFF8DF] border border-[#FC6C26]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
            />
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col">
            <label className="block text-[11px] font-bold uppercase text-[#2D0818] mb-1">
              Original Clauses Text
            </label>
            <textarea
              value={docAText}
              onChange={(e) => setDocAText(e.target.value)}
              rows={9}
              placeholder="Paste original agreement clauses or upload file above..."
              className="w-full p-3.5 text-xs font-mono bg-white border border-[#FC6C26]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC6C26] text-[#18030B] flex-1 resize-y"
            />
            <div className="mt-1 text-right text-[10px] text-slate-500 font-medium">
              {docAText.length} characters • {docAText.trim() ? docAText.trim().split(/\s+/).length : 0} words
            </div>
          </div>
        </div>

        {/* Document B (Revised Draft) */}
        <div className="bg-[#FFFDF5] rounded-3xl shadow-sm border border-[#FC6C26]/25 p-5 space-y-3.5 flex flex-col">
          {/* Header & Clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FC6C26]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D0818]">
                Document B (Revised / Counterparty Markup)
              </h4>
            </div>
            {docBText && (
              <button
                onClick={handleClearB}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputBRef}
            type="file"
            accept=".txt,.md,.doc,.docx"
            aria-hidden="true"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFileB(file);
            }}
            className="hidden"
          />

          {/* Drag & Drop Upload Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload Revised Draft Document B by drag and drop or browse"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputBRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingB(true);
            }}
            onDragLeave={() => setIsDraggingB(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingB(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processFileB(file);
            }}
            onClick={() => fileInputBRef.current?.click()}
            className={`p-3.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
              isDraggingB
                ? "bg-[#FFE8B6] border-[#FC6C26] ring-2 ring-[#FC6C26]"
                : "bg-[#FFF8DF] border-[#FC6C26]/30 hover:bg-[#FFEFC7]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FC6C26]/20 text-[#FC6C26] flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D0818]">
                  {uploadedFileBName ? uploadedFileBName : "Upload Revised Draft (.txt, .md)"}
                </p>
                <p className="text-[10px] text-slate-600">
                  Click or drag file here to import Document B
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#FC6C26]/30 text-[11px] font-bold text-[#2D0818] shrink-0">
              Browse
            </span>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#2D0818] mb-1">
              Document B Label
            </label>
            <input
              type="text"
              value={docBName}
              onChange={(e) => setDocBName(e.target.value)}
              placeholder="e.g. Revised Lease (Stealth Markup v2.0)"
              className="w-full px-3.5 py-2 text-xs font-bold text-[#18030B] bg-[#FFF8DF] border border-[#FC6C26]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
            />
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col">
            <label className="block text-[11px] font-bold uppercase text-[#2D0818] mb-1">
              Revised Clauses Text
            </label>
            <textarea
              value={docBText}
              onChange={(e) => setDocBText(e.target.value)}
              rows={9}
              placeholder="Paste counterparty markup clauses or upload file above..."
              className="w-full p-3.5 text-xs font-mono bg-white border border-[#FC6C26]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC6C26] text-[#18030B] flex-1 resize-y"
            />
            <div className="mt-1 text-right text-[10px] text-slate-500 font-medium">
              {docBText.length} characters • {docBText.trim() ? docBText.trim().split(/\s+/).length : 0} words
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Comparison Button */}
      <div className="flex flex-col items-center justify-center gap-2 pt-2">
        <button
          onClick={handleRunCompare}
          disabled={isLoading || !docAText.trim() || !docBText.trim()}
          className="px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xl shadow-[#FC6C26]/25 flex items-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#1F040F]/30 border-t-[#1F040F] rounded-full animate-spin" />
              <span>Analyzing Contract Drift & Differences...</span>
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4" />
              <span>Run Comparative Diff Audit</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 font-semibold">
          Exposes stealth additions, obligation transfers, and risk escalations between versions
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Comparison Results Section */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-200 pt-4">
          {/* Engine Verification Banner */}
          {modelUsed && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Gemini Live Comparison ({modelUsed})</span>
            </div>
          )}

          {/* Verdict Banner */}
          <div className="bg-[#FFFDF5] rounded-3xl shadow-xl border border-[#FC6C26]/30 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#1F040F] via-[#2D0818] to-[#1F040F] text-[#FFF8DF] border-b border-[#FC6C26]/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#FC6C26]/25 text-[#FC6C26] border border-[#FC6C26]/40">
                    Comparative Verdict
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#FFF8DF] mt-2">
                    {report.overall_verdict}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-3.5 py-2 text-xs font-bold bg-[#FFF8DF] hover:bg-white text-[#2D0818] rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#FC6C26]" />
                    <span>Download Diff (.md)</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-2 text-xs font-bold bg-[#FFF8DF] hover:bg-white text-[#2D0818] rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#FFF8DF]/90 mt-3 leading-relaxed">
                {report.comparison_summary}
              </p>

              {report.risk_drift_summary && (
                <div className="mt-3 text-xs text-[#FC6C26] font-semibold bg-[#1F040F]/60 p-2.5 rounded-xl border border-[#FC6C26]/30">
                  {report.risk_drift_summary}
                </div>
              )}
            </div>

            {/* Strategic Takeaway */}
            <div className="p-5 bg-[#FFF8DF] border-b border-[#FC6C26]/20 text-xs sm:text-sm text-[#2D0818] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FC6C26] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#18030B]">Recommended Strategic Action:</strong>{" "}
                {report.strategic_takeaway}
              </div>
            </div>
          </div>

          {/* Differences List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-[#FC6C26]" />
                <span>Material Clause Shifts & Modifications ({report.differences.length})</span>
              </h4>
              <span className="text-xs text-slate-500 font-semibold">
                Comparing {docAName || "Doc A"} vs {docBName || "Doc B"}
              </span>
            </div>

            {report.differences.map((diff, idx) => {
              const isEscalated = diff.risk_shift === "ESCALATED";
              const isDeEscalated = diff.risk_shift === "DE_ESCALATED";

              return (
                <div
                  key={idx}
                  className={`bg-[#FFFDF5] rounded-3xl shadow-sm border border-[#FC6C26]/25 overflow-hidden ${
                    isEscalated
                      ? "border-l-4 border-l-red-600"
                      : isDeEscalated
                      ? "border-l-4 border-l-emerald-500"
                      : "border-l-4 border-l-slate-400"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <h5 className="font-extrabold text-[#18030B] text-sm sm:text-base">
                        {diff.clause_title}
                      </h5>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-[#FFF8DF] text-[#2D0818] uppercase border border-[#FC6C26]/20">
                          {diff.change_type}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isEscalated
                              ? "bg-red-100 text-red-900 border-red-300"
                              : isDeEscalated
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {diff.risk_shift} RISK
                        </span>
                      </div>
                    </div>

                    {/* Side-by-Side Excerpts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {diff.doc_a_version && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block mb-1 text-[10px] uppercase tracking-wider">
                            Original ({docAName || "Document A"}):
                          </span>
                          <p className="font-mono text-slate-800 italic leading-relaxed">
                            "{diff.doc_a_version}"
                          </p>
                        </div>
                      )}

                      {diff.doc_b_version && (
                        <div className={`p-4 rounded-2xl border ${
                          isEscalated
                            ? "bg-red-50/60 border-red-200"
                            : "bg-emerald-50/60 border-emerald-200"
                        }`}>
                          <span className={`font-bold block mb-1 text-[10px] uppercase tracking-wider ${
                            isEscalated ? "text-red-800" : "text-emerald-800"
                          }`}>
                            Revised ({docBName || "Document B"}):
                          </span>
                          <p className={`font-mono italic leading-relaxed ${
                            isEscalated ? "text-red-950" : "text-emerald-950"
                          }`}>
                            "{diff.doc_b_version}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Plain English Impact & Recommendation */}
                    <div className="space-y-2 text-xs sm:text-sm pt-2 border-t border-[#FC6C26]/15">
                      <div>
                        <strong className="text-[#2D0818]">Practical Impact:</strong>{" "}
                        <span className="text-slate-700 leading-relaxed">{diff.plain_english_impact}</span>
                      </div>
                      <div className="text-[#2D0818] font-medium bg-[#FFF8DF] p-3 rounded-2xl border border-[#FC6C26]/30 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-[#FC6C26] shrink-0 mt-0.5" />
                        <span><strong>Recommendation:</strong> {diff.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
