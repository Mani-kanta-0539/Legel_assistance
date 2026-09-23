"use client";

import React, { useState, useEffect } from "react";
import { UserIntent } from "@/types";
import {
  X,
  Sparkles,
  User,
  Shield,
  HelpCircle,
  ArrowRight,
  Briefcase,
  Home,
  Store,
} from "lucide-react";

interface AuditIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intent: UserIntent) => void;
  onQuickAudit: () => void;
}

const ROLES = [
  { id: "Freelancer / Independent Contractor", label: "Freelancer / Contractor", icon: Briefcase },
  { id: "Residential Tenant / Renter", label: "Tenant / Renter", icon: Home },
  { id: "Small Business Owner / Vendor", label: "Small Business / Vendor", icon: Store },
  { id: "Employee / Worker", label: "Employee / Worker", icon: User },
  { id: "Consumer / General User", label: "Consumer / General", icon: Shield },
];

const CONCERNS = [
  "Intellectual Property & Personal Inventions",
  "Uncapped Indemnity & Skewed Liability",
  "Pay-If-Paid & Payment Delays (Net 60/90)",
  "Non-Compete & Restrictive Covenants",
  "Maintenance Obligations & Deposit Forfeiture",
  "Unilateral Termination Without Kill Fee",
  "Arbitration Clauses & Jury Trial Waivers",
];

export function AuditIntentModal({
  isOpen,
  onClose,
  onSubmit,
  onQuickAudit,
}: AuditIntentModalProps) {
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    "Intellectual Property & Personal Inventions",
    "Uncapped Indemnity & Skewed Liability",
  ]);
  const [customQuestion, setCustomQuestion] = useState("");

  // Dismiss on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleRunTargeted = () => {
    onSubmit({
      role: selectedRole,
      focusAreas: selectedConcerns,
      customQuestion: customQuestion.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-intent-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-[#FFFDF5] rounded-3xl shadow-2xl border border-[#FC6C26]/30 max-w-xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#2D0818] text-[#FFF8DF] flex items-center justify-between border-b border-[#FC6C26]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FC6C26] to-[#68173B] p-0.5 flex items-center justify-center shadow-lg shadow-[#FC6C26]/20">
              <div className="w-full h-full bg-[#1F040F] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FC6C26]" />
              </div>
            </div>
            <div>
              <h3 id="audit-intent-title" className="font-black text-base leading-tight text-[#FFF8DF]">
                Customize Your Audit Focus
              </h3>
              <p className="text-xs text-[#FFF8DF]/70 mt-0.5">
                Tell Gemini what you are searching for to get targeted advice & legal statutory grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#FFF8DF]/60 hover:text-[#FFF8DF] p-1 rounded-lg hover:bg-[#3B0D24] transition-colors focus:outline-none focus:ring-1 focus:ring-[#FC6C26]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 text-[#18030B] max-h-[75vh] overflow-y-auto">
          {/* Question 1: Role */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FC6C26]" />
              1. What is your role or perspective in this contract?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all text-center focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
                      isSelected
                        ? "bg-[#2D0818] text-[#FFF8DF] border-[#FC6C26] shadow-sm ring-1 ring-[#FC6C26]"
                        : "bg-white text-[#2D0818] border-[#FC6C26]/25 hover:bg-[#FFF8DF]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-[#FC6C26]" : "text-slate-500"}`} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Priority Concerns */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#FC6C26]" />
              2. What are your primary concerns? (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((concern) => {
                const isSelected = selectedConcerns.includes(concern);
                return (
                  <button
                    key={concern}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleConcern(concern)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-[#FC6C26] ${
                      isSelected
                        ? "bg-[#FC6C26] text-[#1F040F] border-[#FC6C26] shadow-xs"
                        : "bg-white text-[#2D0818] border-[#FC6C26]/25 hover:bg-[#FFF8DF]"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {concern}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Specific Question */}
          <div className="space-y-2">
            <label htmlFor="custom-question-input" className="block text-xs font-bold uppercase tracking-wider text-[#2D0818] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#FC6C26]" />
              3. Any specific question you want Gemini to answer? (Optional)
            </label>
            <input
              id="custom-question-input"
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g. Can they claim code I develop at home? or Can the landlord enter without notice?"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#FC6C26]/30 rounded-xl text-[#18030B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FC6C26] shadow-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FFF8DF] border-t border-[#FC6C26]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onQuickAudit}
            className="text-xs font-bold text-slate-600 hover:text-[#2D0818] underline order-2 sm:order-1 focus:outline-none focus:ring-1 focus:ring-[#FC6C26]"
          >
            Skip & Run General Audit
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-[#2D0818] hover:bg-[#FFE8B6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2D0818]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunTargeted}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-black text-[#1F040F] bg-[#FC6C26] hover:bg-[#ff7e3d] rounded-xl shadow-lg shadow-[#FC6C26]/25 flex items-center justify-center gap-1.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2D0818]"
            >
              <span>Run Targeted Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
