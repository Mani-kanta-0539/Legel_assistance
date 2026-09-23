import { describe, it, expect } from "vitest";
import {
  AnalyzeRequestSchema,
  ChatRequestSchema,
  CompareRequestSchema,
  ComparedClauseDiffSchema,
  ContractAuditReportSchema,
} from "../../lib/ai/schemas";

describe("Runtime Zod Schema Validation & Parsing", () => {
  describe("API Request Schemas", () => {
    it("should accept valid AnalyzeRequest payload", () => {
      const payload = {
        contractText: "Valid contract agreement text.",
        userIntent: {
          role: "Freelancer",
          focusAreas: ["IP Ownership"],
          customQuestion: "Do I retain copyright?",
        },
      };
      const result = AnalyzeRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should reject empty contractText in AnalyzeRequest", () => {
      const payload = { contractText: "" };
      const result = AnalyzeRequestSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should validate ChatRequest with chat history", () => {
      const payload = {
        message: "Explain the non-compete clause.",
        chatHistory: [
          { role: "user", text: "Hello" },
          { role: "model", text: "Hi, how can I help?" },
        ],
      };
      const result = ChatRequestSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("should require both documents in CompareRequest", () => {
      const invalid = { docAText: "Doc A only" };
      const result = CompareRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);

      const valid = { docAText: "Draft A", docBText: "Draft B" };
      const validResult = CompareRequestSchema.safeParse(valid);
      expect(validResult.success).toBe(true);
    });
  });

  describe("ComparedClauseDiffSchema Case Insensitivity & Resilience", () => {
    it("should normalize lowercase 'modified' and 'escalated' correctly", () => {
      const rawDiff = {
        clause_title: "Indemnification",
        doc_a_version: "Standard indemnity",
        doc_b_version: "Uncapped indemnity",
        change_type: "modified",
        risk_shift: "escalated",
        plain_english_impact: "Liability was made unlimited.",
        recommendation: "Reject and cap at fees paid.",
      };
      const parsed = ComparedClauseDiffSchema.parse(rawDiff);
      expect(parsed.change_type).toBe("MODIFIED");
      expect(parsed.risk_shift).toBe("ESCALATED");
    });

    it("should normalize 'added' and 'de_escalated' correctly", () => {
      const rawDiff = {
        clause_title: "Audit Rights",
        doc_a_version: null,
        doc_b_version: "30-day notice for inspection",
        change_type: "added clause",
        risk_shift: "de-escalated / lower risk",
        plain_english_impact: "Added inspection clause.",
        recommendation: "Acceptable term.",
      };
      const parsed = ComparedClauseDiffSchema.parse(rawDiff);
      expect(parsed.change_type).toBe("ADDED");
      expect(parsed.risk_shift).toBe("DE_ESCALATED");
    });
  });

  describe("ContractAuditReportSchema Full Validation", () => {
    it("should validate a comprehensive contract report", () => {
      const mockReport = {
        document_title: "Consulting Agreement",
        document_summary: "A standard consulting services contract.",
        overall_risk_score: 45,
        risk_tier: "MODERATE",
        triage_recommendation: "NEGOTIATE_WITH_CAUTION",
        summary_stats: {
          total_clauses: 5,
          red_flags: 1,
          amber_flags: 2,
          green_flags: 2,
        },
        clauses: [
          {
            clause_id: "clause_1",
            title: "IP Assignment",
            verbatim_quote: "All inventions shall belong to Client.",
            category: "IP_OWNERSHIP",
            risk_level: "AMBER",
            plain_english_meaning: "Client owns work created.",
            hidden_risks: ["Broad definition of IP"],
            fairness_score: 5,
          },
        ],
        attorney_dossier: {
          executive_summary: "Moderate risk consulting agreement.",
          document_type: "Consulting Agreement",
          parties_identified: ["Client Co", "Consultant"],
          key_deadlines_and_milestones: ["Net 30 payment"],
          critical_red_flags: ["IP assignment scope"],
          top_5_attorney_questions: ["Is the IP assignment limited to deliverables?"],
        },
      };

      const result = ContractAuditReportSchema.safeParse(mockReport);
      expect(result.success).toBe(true);
    });
  });
});
