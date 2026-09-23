"use client";

import React, { useState } from "react";
import { ClauseAudit } from "@/types";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Quote,
  Copy,
  Check,
} from "lucide-react";

interface ClauseCardProps {
  clause: ClauseAudit;
  onOpenCounterProposal: (clause: ClauseAudit) => void;
}

export function ClauseCard({ clause, onOpenCounterProposal }: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "RED":
        return {
          label: "PREDATORY / TRAPDOOR",
          icon: AlertTriangle,
          classes: "bg-red-100 text-red-900 border-red-300 font-bold",
          accentBorder: "border-l-4 border-l-red-600",
        };
      case "AMBER":
        return {
          label: "UNBALANCED / AGGRESSIVE",
          icon: AlertCircle,
          classes: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
          accentBorder: "border-l-4 border-l-amber-500",
        };
      default:
        return {
          label: "FAIR / STANDARD",
          icon: CheckCircle2,
          classes: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
          accentBorder: "border-l-4 border-l-emerald-500",
        };
    }
  };

  const badge = getRiskBadge(clause.risk_level);
  const RiskIcon = badge.icon;

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(clause.verbatim_quote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 1500);
  };

  return (
    <div
      className={`bg-[#FFFDF5] rounded-2xl shadow-xs border border-[#FC6C26]/25 overflow-hidden transition-all ${badge.accentBorder}`}
    >
      {/* Card Header (Click to collapse/expand) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FFF8DF]/70 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${badge.classes}`}
            >
              <RiskIcon className="w-3 h-3" />
              {badge.label}
            </span>
            <span className="text-[11px] font-bold text-[#2D0818] bg-[#FFF8DF] px-2.5 py-0.5 rounded-md border border-[#FC6C26]/20 uppercase tracking-wider">
              {clause.category.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Fairness: {clause.fairness_score}/10
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#18030B] tracking-tight">
            {clause.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 mt-1 line-clamp-2 leading-relaxed">
            {clause.plain_english_meaning}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {clause.counter_proposal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCounterProposal(clause);
              }}
              className="px-3 py-1.5 text-xs font-bold text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redline & Pushback</span>
            </button>
          )}

          <button className="text-slate-400 hover:text-slate-600 p-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#FC6C26]/15 space-y-4 text-xs sm:text-sm">
          {/* Verbatim Excerpt */}
          <div className="p-3.5 rounded-xl bg-[#FFF8DF] border border-[#FC6C26]/25 relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1">
                <Quote className="w-3 h-3 text-[#FC6C26]" />
                Exact Verbatim Quote From Contract
              </span>
              <button
                onClick={handleCopyQuote}
                className="flex items-center gap-1 text-[11px] text-[#2D0818] hover:text-[#18030B] font-bold bg-white px-2 py-0.5 rounded border border-[#FC6C26]/30 shadow-2xs transition-colors"
                title="Copy verbatim excerpt"
              >
                {copiedQuote ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-slate-900 italic leading-relaxed whitespace-pre-wrap">
              "{clause.verbatim_quote}"
            </p>
          </div>

          {/* Plain-English Breakdown */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#2D0818] uppercase tracking-wider">
              Plain-English Breakdown:
            </span>
            <p className="text-slate-800 leading-relaxed">
              {clause.plain_english_meaning}
            </p>
          </div>

          {/* Key Risk Traps */}
          {clause.hidden_risks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#2D0818] uppercase tracking-wider">
                Why This Clause is Hazardous:
              </span>
              <ul className="space-y-1">
                {clause.hidden_risks.map((risk, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Action Footer inside card */}
          {clause.counter_proposal && (
            <div className="pt-2 flex items-center justify-between border-t border-[#FC6C26]/15">
              <span className="text-[11px] text-slate-500 italic">
                Counter-proposal text and client pushback email script generated
              </span>
              <button
                onClick={() => onOpenCounterProposal(clause)}
                className="text-xs font-bold text-[#FC6C26] hover:text-[#ff7e3d] flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Redline Solution →</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
