"use client";

import React from "react";
import { ContractAuditReport } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  FileDown,
  Briefcase,
  AlertCircle,
  Share2,
} from "lucide-react";
import {
  generateAttorneyDossierPdf,
  generateAuditMarkdown,
  triggerBrowserDownload,
} from "@/lib/utils/exporter";

interface RiskScorecardProps {
  report: ContractAuditReport;
  onOpenDossier: () => void;
}

export function RiskScorecard({ report, onOpenDossier }: RiskScorecardProps) {
  const { overall_risk_score, risk_tier, triage_recommendation, summary_stats } =
    report;

  const getTierTheme = (tier: string) => {
    switch (tier) {
      case "CRITICAL":
        return {
          badgeBg: "bg-red-950 text-red-300 border-red-800",
          barBg: "bg-red-600",
          textColor: "text-red-600",
        };
      case "HIGH":
        return {
          badgeBg: "bg-orange-950 text-orange-300 border-orange-800",
          barBg: "bg-orange-500",
          textColor: "text-orange-600",
        };
      case "MODERATE":
        return {
          badgeBg: "bg-amber-950 text-amber-300 border-amber-800",
          barBg: "bg-amber-500",
          textColor: "text-amber-600",
        };
      default:
        return {
          badgeBg: "bg-emerald-950 text-emerald-300 border-emerald-800",
          barBg: "bg-emerald-500",
          textColor: "text-emerald-600",
        };
    }
  };

  const getTriageLabel = (rec: string) => {
    switch (rec) {
      case "CONSULT_ATTORNEY_BEFORE_SIGNING":
        return {
          label: "Stop: Consult Attorney Before Signing",
          icon: AlertTriangle,
          classes: "bg-red-100 text-red-900 border-red-300 font-bold",
        };
      case "NEGOTIATE_WITH_CAUTION":
        return {
          label: "Negotiate Redlines With Caution",
          icon: AlertCircle,
          classes: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
        };
      default:
        return {
          label: "Standard Terms: Safe to Self-Negotiate",
          icon: CheckCircle2,
          classes: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
        };
    }
  };

  const theme = getTierTheme(risk_tier);
  const triage = getTriageLabel(triage_recommendation);
  const TriageIcon = triage.icon;

  const handleDownloadPdf = () => {
    generateAttorneyDossierPdf(report);
  };

  const handleDownloadMarkdown = () => {
    const md = generateAuditMarkdown(report);
    const filename = `${report.document_title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Audit.md`;
    triggerBrowserDownload(md, filename, "text/markdown;charset=utf-8");
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const filename = `${report.document_title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)}_Audit.json`;
    triggerBrowserDownload(jsonStr, filename, "application/json;charset=utf-8");
  };

  return (
    <div className="bg-[#FFFDF5] rounded-3xl shadow-xl border border-[#FC6C26]/30 overflow-hidden mb-8">
      {/* Top Banner with Title and Triage */}
      <div className="p-6 bg-[#2D0818] text-[#FFF8DF] border-b border-[#FC6C26]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-bold px-3 py-0.5 rounded-full border ${theme.badgeBg}`}
              >
                {risk_tier} RISK TIER
              </span>
              <span className="text-xs text-[#FFF8DF]/70 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#FC6C26]" />
                {report.document_title}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#FFF8DF]/90 max-w-3xl leading-relaxed mt-2">
              {report.document_summary}
            </p>
          </div>

          {/* Triage Recommendation Pill */}
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs shrink-0 shadow-md ${triage.classes}`}
          >
            <TriageIcon className="w-4 h-4 shrink-0" />
            <span>{triage.label}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-center bg-[#FFFDF5]">
        {/* Risk Score Gauge */}
        <div className="lg:col-span-2 flex items-center gap-5 p-4 rounded-2xl bg-[#FFF8DF] border border-[#FC6C26]/30 shadow-xs">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white shadow-md border border-[#FC6C26]/30">
              <div className="text-center">
                <span className={`text-2xl font-black ${theme.textColor}`}>
                  {overall_risk_score}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-bold">
                  / 100
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#2D0818] mb-1.5">
              <span id="risk-score-label">Overall Risk Index</span>
              <span className={theme.textColor}>{risk_tier}</span>
            </div>
            <div
              role="progressbar"
              aria-labelledby="risk-score-label"
              aria-valuenow={overall_risk_score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${overall_risk_score} out of 100 — ${risk_tier} risk`}
              className="w-full bg-[#E5D7B7] rounded-full h-3 overflow-hidden p-0.5"
            >
              <div
                className={`h-2 rounded-full transition-all duration-700 ${theme.barBg}`}
                style={{ width: `${Math.min(100, Math.max(5, overall_risk_score))}%` }}
              />
            </div>
            <p className="text-[11px] text-[#2D0818]/70 mt-1.5 font-medium">
              Calculated from unfair indemnities &amp; asymmetric liabilities
            </p>
          </div>
        </div>

        {/* Breakdown Counts */}
        <div className="lg:col-span-3 grid grid-cols-3 gap-3" role="group" aria-label="Risk clause breakdown">
          {/* Red Flag Count */}
          <div
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-center"
            aria-label={`${summary_stats.red_flags} predatory or critical risk clauses found`}
          >
            <div className="text-2xl font-black text-red-700" aria-hidden="true">
              {summary_stats.red_flags}
            </div>
            <div className="text-xs font-bold text-red-900 mt-0.5">
              Predatory Traps
            </div>
            <div className="text-[10px] text-red-600/90 mt-0.5">
              Critical Risk
            </div>
          </div>

          {/* Amber Flag Count */}
          <div
            className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center"
            aria-label={`${summary_stats.amber_flags} unbalanced clauses that need redlining`}
          >
            <div className="text-2xl font-black text-amber-700" aria-hidden="true">
              {summary_stats.amber_flags}
            </div>
            <div className="text-xs font-bold text-amber-900 mt-0.5">
              Unbalanced
            </div>
            <div className="text-[10px] text-amber-700/90 mt-0.5">
              Needs Redline
            </div>
          </div>

          {/* Green Flag Count */}
          <div
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center"
            aria-label={`${summary_stats.green_flags} standard or fair clauses`}
          >
            <div className="text-2xl font-black text-emerald-700" aria-hidden="true">
              {summary_stats.green_flags}
            </div>
            <div className="text-xs font-bold text-emerald-900 mt-0.5">
              Standard / Fair
            </div>
            <div className="text-[10px] text-emerald-700/90 mt-0.5">
              Market Customary
            </div>
          </div>
        </div>
      </div>

      {/* Export & Action Toolbar */}
      <div className="px-6 py-4 bg-[#FFF8DF] border-t border-[#FC6C26]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#2D0818] font-bold flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-[#FC6C26]" />
          <span>Client-to-Counsel Preparation & Exporters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Attorney Brief Modal */}
          <button
            type="button"
            onClick={onOpenDossier}
            aria-label="Open attorney briefing dossier modal"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2D0818] hover:bg-[#3B0D24] text-[#FFF8DF] flex items-center gap-1.5 shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#FC6C26]" />
            <span>Open Attorney Briefing Dossier</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            aria-label="Download attorney dossier as PDF"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] flex items-center gap-1.5 shadow-md shadow-[#FC6C26]/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2D0818]"
            title="Download Attorney Dossier as formatted PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Download Markdown */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            aria-label="Download full audit report as Markdown file"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-[#2D0818] border border-[#FC6C26]/40 flex items-center gap-1.5 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
            title="Download complete audit as Markdown"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Markdown (.md)</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            aria-label="Download raw JSON audit report"
            className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-[#2D0818] border border-[#FC6C26]/40 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FC6C26]"
            title="Download raw JSON report"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
