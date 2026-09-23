"use client";

import React, { useState, useMemo } from "react";
import { ClauseAudit, RiskLevel } from "@/types";
import { ClauseCard } from "@/components/ClauseCard";
import { Search, Filter } from "lucide-react";

interface ClauseListProps {
  clauses: ClauseAudit[];
  onOpenCounterProposal: (clause: ClauseAudit) => void;
}

export function ClauseList({
  clauses,
  onOpenCounterProposal,
}: ClauseListProps) {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | RiskLevel>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClauses = useMemo(() => {
    return clauses.filter((clause) => {
      // Risk level filter
      if (selectedFilter !== "ALL" && clause.risk_level !== selectedFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = clause.title.toLowerCase().includes(query);
        const matchesCategory = clause.category.toLowerCase().includes(query);
        const matchesMeaning = clause.plain_english_meaning
          .toLowerCase()
          .includes(query);
        const matchesQuote = clause.verbatim_quote.toLowerCase().includes(query);
        return matchesTitle || matchesCategory || matchesMeaning || matchesQuote;
      }
      return true;
    });
  }, [clauses, selectedFilter, searchQuery]);

  const redCount = clauses.filter((c) => c.risk_level === "RED").length;
  const amberCount = clauses.filter((c) => c.risk_level === "AMBER").length;
  const greenCount = clauses.filter((c) => c.risk_level === "GREEN").length;

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Clauses ({clauses.length})
          </button>

          <button
            onClick={() => setSelectedFilter("RED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              selectedFilter === "RED"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Predatory ({redCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter("AMBER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              selectedFilter === "AMBER"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Unbalanced ({amberCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter("GREEN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              selectedFilter === "GREEN"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Fair ({greenCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses or legalese..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Clause Cards List */}
      {filteredClauses.length > 0 ? (
        <div className="space-y-3">
          {filteredClauses.map((clause) => (
            <ClauseCard
              key={clause.clause_id}
              clause={clause}
              onOpenCounterProposal={onOpenCounterProposal}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-sm text-slate-700">No matching clauses found</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Try adjusting your search query or severity filter
          </p>
        </div>
      )}
    </div>
  );
}
