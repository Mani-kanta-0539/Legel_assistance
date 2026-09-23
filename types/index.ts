export type RiskLevel = "GREEN" | "AMBER" | "RED";

export type OverallRiskTier = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export type TriageRecommendation =
  | "SELF_NEGOTIATE"
  | "NEGOTIATE_WITH_CAUTION"
  | "CONSULT_ATTORNEY_BEFORE_SIGNING";

export type ClauseCategory =
  | "IP_OWNERSHIP"
  | "LIABILITY_INDEMNITY"
  | "TERMINATION"
  | "PAYMENT_TERMS"
  | "RESTRICTIVE_COVENANT"
  | "DISPUTE_RESOLUTION"
  | "WARRANTY_HABITABILITY"
  | "PRIVACY_CONFIDENTIALITY"
  | "OTHER";

export interface CounterProposal {
  balanced_clause: string;
  negotiation_rationale: string;
  email_script: string;
}

export interface ClauseAudit {
  clause_id: string;
  title: string;
  verbatim_quote: string;
  category: ClauseCategory;
  risk_level: RiskLevel;
  plain_english_meaning: string;
  hidden_risks: string[];
  fairness_score: number; // 1 (predatory) to 10 (exceptionally fair)
  counter_proposal?: CounterProposal;
}

export interface AttorneyDossier {
  executive_summary: string;
  document_type: string;
  parties_identified: string[];
  key_deadlines_and_milestones: string[];
  critical_red_flags: string[];
  top_5_attorney_questions: string[];
}

export interface StatutoryOrigin {
  topic: string;
  governing_statute_or_rule: string;
  plain_explanation: string;
  jurisdiction_context: string;
}

export interface CustomFocusAnalysis {
  target_role: string;
  answers_to_user_questions: string[];
  priority_risks_for_role: string[];
  statutory_origins: StatutoryOrigin[];
}

export interface UserIntent {
  role?: string;
  focusAreas?: string[];
  customQuestion?: string;
}

export interface ContractAuditReport {
  document_title: string;
  document_summary: string;
  overall_risk_score: number; // 0 to 100
  risk_tier: OverallRiskTier;
  triage_recommendation: TriageRecommendation;
  summary_stats: {
    total_clauses: number;
    red_flags: number;
    amber_flags: number;
    green_flags: number;
  };
  clauses: ClauseAudit[];
  attorney_dossier: AttorneyDossier;
  custom_focus_analysis?: CustomFocusAnalysis;
}

export interface ComparedClauseDiff {
  clause_title: string;
  doc_a_version?: string;
  doc_b_version?: string;
  change_type: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  risk_shift: "ESCALATED" | "DE_ESCALATED" | "NEUTRAL";
  plain_english_impact: string;
  recommendation: string;
}

export interface ContractComparisonReport {
  comparison_summary: string;
  doc_a_name: string;
  doc_b_name: string;
  overall_verdict: string;
  risk_drift_summary: string;
  differences: ComparedClauseDiff[];
  strategic_takeaway: string;
}

export interface SamplePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  expectedRisk: OverallRiskTier;
  content: string;
}

export interface ComparePreset {
  id: string;
  title: string;
  description: string;
  docA: { name: string; content: string };
  docB: { name: string; content: string };
}
