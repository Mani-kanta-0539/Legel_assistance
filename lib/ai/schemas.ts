import { z } from "zod";

export const RiskLevelSchema = z.enum(["GREEN", "AMBER", "RED"]);
export const OverallRiskTierSchema = z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]);
export const TriageRecommendationSchema = z.enum([
  "SELF_NEGOTIATE",
  "NEGOTIATE_WITH_CAUTION",
  "CONSULT_ATTORNEY_BEFORE_SIGNING",
]);

export const ClauseCategorySchema = z.enum([
  "IP_OWNERSHIP",
  "LIABILITY_INDEMNITY",
  "TERMINATION",
  "PAYMENT_TERMS",
  "RESTRICTIVE_COVENANT",
  "DISPUTE_RESOLUTION",
  "WARRANTY_HABITABILITY",
  "PRIVACY_CONFIDENTIALITY",
  "OTHER",
]);

export const CounterProposalSchema = z.object({
  balanced_clause: z.string(),
  negotiation_rationale: z.string(),
  email_script: z.string(),
});

export const ClauseAuditSchema = z.object({
  clause_id: z.string(),
  title: z.string(),
  verbatim_quote: z.string(),
  category: ClauseCategorySchema,
  risk_level: RiskLevelSchema,
  plain_english_meaning: z.string(),
  hidden_risks: z.array(z.string()),
  fairness_score: z.number().min(1).max(10),
  counter_proposal: CounterProposalSchema.optional(),
});

export const AttorneyDossierSchema = z.object({
  executive_summary: z.string(),
  document_type: z.string(),
  parties_identified: z.array(z.string()),
  key_deadlines_and_milestones: z.array(z.string()),
  critical_red_flags: z.array(z.string()),
  top_5_attorney_questions: z.array(z.string()),
});

export const StatutoryOriginSchema = z.object({
  topic: z.string(),
  governing_statute_or_rule: z.string(),
  plain_explanation: z.string(),
  jurisdiction_context: z.string(),
});

export const CustomFocusAnalysisSchema = z.object({
  target_role: z.string(),
  answers_to_user_questions: z.array(z.string()),
  priority_risks_for_role: z.array(z.string()),
  statutory_origins: z.array(StatutoryOriginSchema),
});

export const ContractAuditReportSchema = z.object({
  document_title: z.string(),
  document_summary: z.string(),
  overall_risk_score: z.number().min(0).max(100),
  risk_tier: OverallRiskTierSchema,
  triage_recommendation: TriageRecommendationSchema,
  summary_stats: z.object({
    total_clauses: z.number(),
    red_flags: z.number(),
    amber_flags: z.number(),
    green_flags: z.number(),
  }),
  clauses: z.array(ClauseAuditSchema),
  attorney_dossier: AttorneyDossierSchema,
  custom_focus_analysis: CustomFocusAnalysisSchema.optional(),
});

export const ComparedClauseDiffSchema = z.object({
  clause_title: z.string(),
  doc_a_version: z.string().optional().nullable().transform((v) => v || undefined),
  doc_b_version: z.string().optional().nullable().transform((v) => v || undefined),
  change_type: z.string().transform((val): "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED" => {
    const u = (val || "").toUpperCase();
    if (u.includes("ADD")) return "ADDED";
    if (u.includes("REM") || u.includes("DEL")) return "REMOVED";
    if (u.includes("MOD") || u.includes("REV") || u.includes("EDIT")) return "MODIFIED";
    return "UNCHANGED";
  }),
  risk_shift: z.string().transform((val): "ESCALATED" | "DE_ESCALATED" | "NEUTRAL" => {
    const u = (val || "").toUpperCase();
    if (u.includes("DE_ESC") || u.includes("DE-ESC") || u.includes("DEESC") || u.includes("DEC") || u.includes("LOW") || u.includes("FAV") || u.includes("REDU")) return "DE_ESCALATED";
    if (u.includes("ESC") || u.includes("INC") || u.includes("HIGH")) return "ESCALATED";
    return "NEUTRAL";
  }),
  plain_english_impact: z.string(),
  recommendation: z.string(),
});

export const ContractComparisonReportSchema = z.object({
  comparison_summary: z.string(),
  doc_a_name: z.string(),
  doc_b_name: z.string(),
  overall_verdict: z.string(),
  risk_drift_summary: z.string(),
  differences: z.array(ComparedClauseDiffSchema),
  strategic_takeaway: z.string(),
});

// Runtime API Request Schemas
export const AnalyzeRequestSchema = z.object({
  contractText: z.string().min(1, "Please provide a valid, non-empty contract document."),
  apiKey: z.string().optional(),
  userIntent: z.object({
    role: z.string().optional(),
    focusAreas: z.array(z.string()).optional(),
    customQuestion: z.string().optional(),
  }).optional(),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1, "A valid message is required."),
  contractText: z.string().optional(),
  reportSummary: z.string().optional(),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "model", "assistant"]),
      text: z.string(),
    })
  ).optional(),
});

export const CompareRequestSchema = z.object({
  docAName: z.string().optional().default("Document A"),
  docAText: z.string().min(1, "Document A text is required."),
  docBName: z.string().optional().default("Document B"),
  docBText: z.string().min(1, "Document B text is required."),
  apiKey: z.string().optional(),
});
