"use client";

import React, { useRef, useState } from "react";
import { SAMPLE_PRESETS } from "@/lib/presets/sampleContracts";
import {
  Upload,
  Trash2,
  Sparkles,
  FileText,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  FileUp,
  CheckCircle2,
} from "lucide-react";

interface ContractInputProps {
  contractText: string;
  setContractText: (text: string) => void;
  onRequestAudit: () => void;
  isLoading: boolean;
  activePresetId: string | null;
  setActivePresetId: (id: string | null) => void;
}

export function ContractInput({
  contractText,
  setContractText,
  onRequestAudit,
  isLoading,
  activePresetId,
  setActivePresetId,
}: ContractInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setContractText(preset.content);
      setActivePresetId(preset.id);
      setUploadedFileName(null);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setContractText(content);
        setActivePresetId(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = () => {
    setContractText("");
    setActivePresetId(null);
    setUploadedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const charCount = contractText.length;
  const wordCount = contractText.trim()
    ? contractText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="bg-[#FFFDF5] rounded-3xl shadow-xl border border-[#FC6C26]/30 overflow-hidden mb-8">
      {/* Prominent File Upload Banner */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload contract document by drag and drop or browsing"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-5 sm:p-6 border-b transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
          isDragging
            ? "bg-[#FFE8B6] border-[#FC6C26] ring-2 ring-[#FC6C26]"
            : "bg-[#FFF8DF] border-[#FC6C26]/25 hover:bg-[#FFEFC7]"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#2D0818] text-[#FC6C26] flex items-center justify-center shrink-0 shadow-md">
            <FileUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="text-sm font-extrabold text-[#2D0818]">
                Upload Contract Document (.txt, .md, .doc)
              </h4>
              {uploadedFileName && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Loaded: {uploadedFileName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Drag & drop your agreement file here, or click / press Enter to browse from your device
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Browse contract file from local device"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="px-4 py-2 rounded-xl text-xs font-black text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] shadow-sm transition-all flex items-center gap-1.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2D0818]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Browse File</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.md,.doc"
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Preset Quick Selectors */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#FC6C26]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FC6C26]" />
            Or Test With A Sample Contract Preset:
          </span>
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            Click any preset below to populate test text
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-[#2D0818] text-[#FFF8DF] shadow-md ring-2 ring-[#FC6C26]"
                    : "bg-[#FFF8DF] text-[#2D0818] border border-[#FC6C26]/30 hover:bg-[#FFE8B6] hover:border-[#FC6C26]"
                }`}
              >
                {preset.id === "predatory-freelance" && (
                  <AlertTriangle className={`w-3.5 h-3.5 ${isSelected ? "text-[#FC6C26]" : "text-red-500"}`} />
                )}
                {preset.id === "aggressive-residential-lease" && (
                  <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-[#FC6C26]" : "text-orange-500"}`} />
                )}
                {preset.id === "asymmetric-mutual-nda" && (
                  <FileCheck className={`w-3.5 h-3.5 ${isSelected ? "text-[#FC6C26]" : "text-amber-500"}`} />
                )}
                {preset.id === "fair-standard-consultancy" && (
                  <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? "text-[#FC6C26]" : "text-emerald-500"}`} />
                )}
                {preset.id === "prompt-injection-attack-sample" && (
                  <span className="text-xs">🛡️</span>
                )}
                <span>{preset.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contract Textarea Body */}
      <div className="p-4 sm:p-5">
        <div className="relative">
          <textarea
            value={contractText}
            onChange={(e) => {
              setContractText(e.target.value);
              setActivePresetId(null);
            }}
            placeholder="Paste your contract, agreement, lease, or statement of work here, or click one of the presets above..."
            rows={10}
            className="w-full p-4 text-xs sm:text-sm font-mono leading-relaxed bg-white border border-[#FC6C26]/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FC6C26] text-[#18030B] placeholder-slate-400 resize-y shadow-inner"
          />

          {contractText && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-3 bottom-4 px-2.5 py-1 text-[11px] font-semibold bg-[#FFF8DF] hover:bg-red-50 text-slate-600 hover:text-red-700 border border-[#FC6C26]/30 rounded-lg shadow-xs flex items-center gap-1 transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Text</span>
            </button>
          )}
        </div>

        {/* Footer toolbar: Counter & Analyze CTA */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#2D0818]/80 font-medium flex items-center gap-3">
            <span>
              <strong>{wordCount.toLocaleString()}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong>{charCount.toLocaleString()}</strong> characters
            </span>
            <span>•</span>
            <span className="text-[#FC6C26] font-semibold">
              Sandboxed input isolation enabled
            </span>
          </div>

          <button
            type="button"
            onClick={onRequestAudit}
            disabled={isLoading || !contractText.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl font-black text-xs sm:text-sm text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-[#FC6C26]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1F040F]/40 border-t-[#1F040F] rounded-full animate-spin" />
                <span>Auditing Clauses & Legal Traps...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Audit Contract For Risks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
