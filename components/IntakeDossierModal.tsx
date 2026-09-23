"use client";

import React, { useState } from "react";
import { ContractAuditReport } from "@/types";
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Briefcase,
  AlertTriangle,
  Calendar,
  HelpCircle,
  FileDown,
} from "lucide-react";
import {
  generateAttorneyDossierPdf,
  generateAuditMarkdown,
  triggerBrowserDownload,
} from "@/lib/utils/exporter";

interface IntakeDossierModalProps {
  report: ContractAuditReport;
  isOpen: boolean;
  onClose: () => void;
}

export function IntakeDossierModal({
  report,
  isOpen,
  onClose,
}: IntakeDossierModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { attorney_dossier } = report;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateAttorneyDossierPdf(report);
  };

  const handleDownloadMarkdown = () => {
    const md = generateAuditMarkdown(report);
    const filename = `Attorney_Dossier_${report.document_title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 25)}.md`;
    triggerBrowserDownload(md, filename, "text/markdown;charset=utf-8");
  };

  const copyBriefText = () => {
    const text = `
CLAUSEGUARD: ATTORNEY INTAKE BRIEF
Document: ${report.document_title}
Risk Index: ${report.overall_risk_score}/100 (${report.risk_tier})

EXECUTIVE SUMMARY FOR COUNSEL:
${attorney_dossier.executive_summary}

PARTIES IDENTIFIED:
${attorney_dossier.parties_identified.join(", ")}

CRITICAL RED FLAGS:
${attorney_dossier.critical_red_flags.map((f) => `• ${f}`).join("\n")}

KEY DEADLINES & MILESTONES:
${attorney_dossier.key_deadlines_and_milestones.map((d) => `• ${d}`).join("\n")}

TOP 5 STRATEGIC ATTORNEY CONSULTATION QUESTIONS:
${attorney_dossier.top_5_attorney_questions.map((q) => `• ${q}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Client-to-Counsel Intake Dossier
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured consultation brief designed to minimize billable attorney hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">
            Export Options:
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Dossier</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Markdown</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={copyBriefText}
              className="px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dossier Content Sheet (Printable Layout) */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800 bg-slate-50/30 print:p-0 print:overflow-visible">
          {/* Top Metadata Header */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                ATTORNEY CONSULTATION DOSSIER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Confidential Client Preparation
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              {report.document_title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
              <span><strong>Doc Type:</strong> {attorney_dossier.document_type}</span>
              <span>•</span>
              <span><strong>Assessed Risk:</strong> {report.overall_risk_score}/100 ({report.risk_tier})</span>
              <span>•</span>
              <span><strong>Parties:</strong> {attorney_dossier.parties_identified.join(", ")}</span>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              1. Executive Summary for Legal Counsel
            </h4>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
              {attorney_dossier.executive_summary}
            </div>
          </div>

          {/* 2. Critical Red Flags */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              2. Critical Unconscionable Red Flags
            </h4>
            <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
              {attorney_dossier.critical_red_flags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-red-950 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Deadlines & Milestones */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              3. Critical Deadlines & Milestone Obligations
            </h4>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              {attorney_dossier.key_deadlines_and_milestones.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Top 5 Questions for Attorney */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              4. Top 5 High-Impact Questions to Ask Your Attorney
            </h4>
            <p className="text-[11px] text-slate-500">
              Asking these specific statutory and enforceability questions during your first 15 minutes ensures maximum value from legal consultation fees.
            </p>
            <div className="space-y-2.5">
              {attorney_dossier.top_5_attorney_questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm text-indigo-950 font-semibold flex items-start gap-2.5 shadow-2xs"
                >
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <span className="leading-snug">{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 italic">
            ClauseGuard • Empowering non-lawyers with structured legal intake intelligence
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
