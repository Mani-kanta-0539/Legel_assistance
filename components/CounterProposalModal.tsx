"use client";

import React, { useState } from "react";
import { ClauseAudit } from "@/types";
import { X, Copy, Check, Sparkles, Send, ShieldCheck, HelpCircle } from "lucide-react";

interface CounterProposalModalProps {
  clause: ClauseAudit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CounterProposalModal({
  clause,
  isOpen,
  onClose,
}: CounterProposalModalProps) {
  const [copiedClause, setCopiedClause] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !clause || !clause.counter_proposal) return null;

  const { counter_proposal } = clause;

  const copyToClipboard = (text: string, isEmail: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEmail) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } else {
      setCopiedClause(true);
      setTimeout(() => setCopiedClause(false), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Redline & Pushback Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeting: {clause.title} ({clause.category})
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Original Problematic Excerpt */}
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs">
            <div className="font-bold text-red-900 flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Original Contract Excerpt (Flagged):
            </div>
            <p className="font-mono text-red-800 italic bg-white/70 p-2 rounded border border-red-100 leading-relaxed">
              "{clause.verbatim_quote}"
            </p>
          </div>

          {/* Section 1: Balanced Counter-Clause */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Balanced Market Substitute Clause
              </label>
              <button
                onClick={() =>
                  copyToClipboard(counter_proposal.balanced_clause, false)
                }
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedClause ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Clause</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed border border-slate-800">
              {counter_proposal.balanced_clause}
            </div>
          </div>

          {/* Section 2: Negotiation Rationale */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs space-y-1">
            <div className="font-bold text-indigo-950 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              Why This Redline is Equitable & Standard:
            </div>
            <p className="text-indigo-900 leading-relaxed">
              {counter_proposal.negotiation_rationale}
            </p>
          </div>

          {/* Section 3: Ready-to-Send Email Script */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                Ready-to-Send Counterparty Email Script
              </label>
              <button
                onClick={() =>
                  copyToClipboard(counter_proposal.email_script, true)
                }
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Email!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed">
              {counter_proposal.email_script}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
