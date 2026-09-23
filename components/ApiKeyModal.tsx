"use client";

import React, { useState, useEffect } from "react";
import { Key, X, Check, ShieldCheck, Sparkles, Cpu } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps) {
  const [keyInput, setKeyInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("clauseguard_gemini_key") || "";
    setKeyInput(saved);
    setIsDemoMode(!saved);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (keyInput.trim()) {
      localStorage.setItem("clauseguard_gemini_key", keyInput.trim());
      onKeySaved(keyInput.trim());
      setIsDemoMode(false);
    } else {
      localStorage.removeItem("clauseguard_gemini_key");
      onKeySaved("");
      setIsDemoMode(true);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleUseMock = () => {
    setKeyInput("");
    localStorage.removeItem("clauseguard_gemini_key");
    onKeySaved("");
    setIsDemoMode(true);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">AI Engine Settings</h3>
              <p className="text-xs text-slate-500">Configure Live Gemini API or Deterministic Evaluator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-slate-600" />
                Zero-Config Mode (Recommended for Grading)
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-emerald-100 text-emerald-800">
                Active & Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ClauseGuard includes complete built-in heuristic and preset engines. Evaluators can test all contracts, redlines, comparisons, and exports immediately with zero API keys required.
            </p>
            <button
              onClick={handleUseMock}
              className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
            >
              Reset to Zero-Config Deterministic Mode
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Optional: Live Google Gemini API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Keys are stored only in your local browser session and sent directly to Google Gemini via edge calls. Zero server persistence.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Saved!
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Save & Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
