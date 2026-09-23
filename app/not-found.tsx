import React from "react";
import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1F040F] text-[#FFF8DF] flex flex-col items-center justify-center p-6 text-center selection:bg-[#FC6C26] selection:text-[#1F040F]">
      <div className="max-w-md w-full bg-[#2D0818] border border-[#FC6C26]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#FC6C26] text-[#1F040F] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FC6C26]/30">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#FC6C26] mb-2 block">
          Error 404 • Page Not Found
        </span>

        <h2 className="text-2xl font-black text-[#FFF8DF] mb-3 tracking-tight">
          Contract Clause Not Found
        </h2>

        <p className="text-xs text-[#FFF8DF]/75 mb-6 leading-relaxed">
          The legal intake page or agreement section you requested does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FC6C26] hover:bg-[#ff7e3d] text-[#1F040F] font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1F040F] hover:bg-[#3B0D24] text-[#FFF8DF] font-bold text-xs border border-[#FC6C26]/30 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FC6C26]" />
            <span>Go to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
