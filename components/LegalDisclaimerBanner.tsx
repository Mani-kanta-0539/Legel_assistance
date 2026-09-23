import React from "react";
import { ShieldAlert, Info } from "lucide-react";

export function LegalDisclaimerBanner() {
  return (
    <div className="bg-[#FFF8DF] border-b border-[#FC6C26]/25 text-[#2D0818] px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#FC6C26] shrink-0" />
          <span>
            <strong>Legal Assistance Boundary:</strong> ClauseGuard is an educational analysis and intake preparation tool. It does <strong>not</strong> constitute formal legal counsel or create an attorney-client relationship.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[#2D0818]/70 font-semibold shrink-0">
          <Info className="w-3.5 h-3.5 text-[#FC6C26]" />
          <span>Always consult qualified counsel for binding disputes</span>
        </div>
      </div>
    </div>
  );
}
