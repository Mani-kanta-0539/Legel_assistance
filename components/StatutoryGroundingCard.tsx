"use client";

import React from "react";
import { CustomFocusAnalysis } from "@/types";
import {
  Scale,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  BookOpen,
  MapPin,
  CheckCircle2,
} from "lucide-react";

interface StatutoryGroundingCardProps {
  focusAnalysis: CustomFocusAnalysis;
}

export function StatutoryGroundingCard({
  focusAnalysis,
}: StatutoryGroundingCardProps) {
  const { target_role, answers_to_user_questions, priority_risks_for_role, statutory_origins } =
    focusAnalysis;

  if (!answers_to_user_questions?.length && !statutory_origins?.length) {
    return null;
  }

  return (
    <div className="bg-[#FFFDF5] rounded-3xl shadow-xl border border-[#FC6C26]/30 overflow-hidden mb-8">
      {/* Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2D0818] via-[#480E28] to-[#2D0818] text-[#FFF8DF] border-b border-[#FC6C26]/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FC6C26]/20 text-[#FC6C26] flex items-center justify-center border border-[#FC6C26]/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#FFF8DF]">
                  Targeted Intelligence & Statutory Grounding
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FC6C26] text-[#1F040F] uppercase tracking-wider">
                  {target_role}
                </span>
              </div>
              <p className="text-xs text-[#FFF8DF]/75 mt-0.5">
                Gemini evaluated this document specifically for your declared perspective and mapped governing legal rules
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Section 1: Answers to User's Specific Concerns */}
        {answers_to_user_questions && answers_to_user_questions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#FC6C26]" />
              Targeted Answers to Your Contract Inquiries
            </h4>
            <div className="space-y-2">
              {answers_to_user_questions.map((ans, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FFF8DF] border border-[#FC6C26]/25 text-xs sm:text-sm text-[#18030B] flex items-start gap-2.5 leading-relaxed shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ans}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Statutory Origins & Governing Legal Doctrines */}
        {statutory_origins && statutory_origins.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#FC6C26]" />
                Where These Legal Rules & Protections Originate (Statutory Citations)
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">
                Statutory & Regulatory Precedents
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {statutory_origins.map((origin, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#FC6C26]/25 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFF8DF] text-[#2D0818] border border-[#FC6C26]/20">
                      {origin.topic}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-[#FC6C26]" />
                      {origin.jurisdiction_context}
                    </span>
                  </div>

                  <h5 className="font-black text-xs sm:text-sm text-[#2D0818]">
                    {origin.governing_statute_or_rule}
                  </h5>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {origin.plain_explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
