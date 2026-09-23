"use client";

import React from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1F040F] text-[#FFF8DF] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#2D0818] border border-[#FC6C26]/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FC6C26] text-[#1F040F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FC6C26]/30">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-[#FFF8DF] mb-2 tracking-tight">
            ClauseGuard Critical Recovery
          </h2>

          <p className="text-xs text-[#FFF8DF]/75 mb-6 leading-relaxed">
            The application root encountered an initialization exception. Click below to reload.
          </p>

          <button
            onClick={() => reset()}
            className="w-full px-5 py-3 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
