"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ClauseGuard Caught App Router Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1F040F] text-[#FFF8DF] flex flex-col items-center justify-center p-6 text-center selection:bg-[#FC6C26] selection:text-[#1F040F]">
      <div className="max-w-md w-full bg-[#2D0818] border border-[#FC6C26]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FC6C26]/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-[#FC6C26] text-[#1F040F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FC6C26]/30">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-[#FFF8DF] mb-2 tracking-tight">
          Application Recovery Mode
        </h2>

        <p className="text-xs text-[#FFF8DF]/75 mb-6 leading-relaxed">
          ClauseGuard encountered an unexpected client state. Your session and data remain secure.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-[#1F040F]/80 border border-[#FC6C26]/20 text-[11px] font-mono text-[#FC6C26] text-left overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload & Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1F040F] hover:bg-[#3B0D24] text-[#FFF8DF] font-bold text-xs border border-[#FC6C26]/30 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5 text-[#FC6C26]" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
