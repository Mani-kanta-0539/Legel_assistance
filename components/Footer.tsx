import React from "react";
import { Shield, Award, Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1F040F] text-[#FFF8DF]/75 text-xs border-t border-[#FC6C26]/30 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#FC6C26]/20 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FC6C26] to-[#480E28] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#1F040F] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#FC6C26]" />
              </div>
            </div>
            <span className="text-[#FFF8DF] font-black text-sm tracking-tight">
              ClauseGuard
            </span>
            <span className="text-[#FC6C26]">•</span>
            <span className="text-[#FFF8DF]/80 text-xs font-medium">
              AI for Legal Assistance & Access
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D0818] border border-[#FC6C26]/30 text-[#FFF8DF]">
            <Award className="w-4 h-4 text-[#FC6C26]" />
            <span className="font-bold text-xs text-[#FFF8DF]">Google Prompt Wars Competition Entry</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#FFF8DF]/75">
          <div>
            <h5 className="font-bold text-[#FFF8DF] uppercase tracking-wider mb-2 text-[11px] text-[#FC6C26]">
              Legal Boundary & Compliance
            </h5>
            <p className="leading-relaxed text-[#FFF8DF]/70">
              ClauseGuard is designed to bridge the justice gap by providing accessible document auditing, differential risk analysis, and intake preparation. It operates within the informational boundary and does not replace professional licensed legal counsel.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[#FFF8DF] uppercase tracking-wider mb-2 text-[11px] text-[#FC6C26]">
              Privacy & Threat Immunity
            </h5>
            <p className="leading-relaxed text-[#FFF8DF]/70">
              Contract text is processed with strict prompt-sandboxing to neutralize indirect prompt injection exploits. Zero server-side persistence of sensitive user agreements guarantees strict confidentiality.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-[#FFF8DF] uppercase tracking-wider mb-2 text-[11px] text-[#FC6C26]">
              Dual-Engine Intelligence
            </h5>
            <p className="leading-relaxed text-[#FFF8DF]/70 flex items-start gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#FC6C26] shrink-0 mt-0.5" />
              <span>
                Zero-config deterministic heuristic evaluator for instant offline grading paired with live Google Gemini structured JSON reasoning for in-depth statutory analysis.
              </span>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#FC6C26]/15 text-center text-[11px] text-[#FFF8DF]/50">
          ClauseGuard: AI Contract Risk & Legal Intake Assistant • Styled in Deep Berry + Vanilla Cloud • Powered by Google Gemini
        </div>
      </div>
    </footer>
  );
}
