import { describe, it, expect } from "vitest";
import { runMockAudit, runMockCompare } from "../../lib/ai/mockEngine";

describe("Deterministic Legal Engine & Fallback Mechanics", () => {
  it("should generate a complete structured report for freelance contracts", () => {
    const freelanceSample = "The freelancer shall indemnify client without limit. Payment Net 90.";
    const report = runMockAudit(freelanceSample, {
      role: "Freelancer / Independent Contractor",
      focusAreas: ["Uncapped Indemnity & Skewed Liability"],
      customQuestion: "Can I be sued for unlimited damages?",
    });

    expect(report.document_title).toBeDefined();
    expect(report.overall_risk_score).toBeGreaterThan(0);
    expect(report.clauses.length).toBeGreaterThan(0);
    expect(report.attorney_dossier.top_5_attorney_questions.length).toBe(5);
    expect(report.custom_focus_analysis?.statutory_origins.length).toBeGreaterThan(0);
  });

  it("should generate structured comparison report between two drafts", () => {
    const docA = "Contractor warrants services for 30 days.";
    const docB = "Contractor warrants services for 1 year and assumes all consequential damages.";

    const comparison = runMockCompare(
      "Original SOW",
      docA,
      "Counterparty Redline",
      docB
    );

    expect(comparison.comparison_summary).toBeDefined();
    expect(comparison.differences.length).toBeGreaterThan(0);
    expect(comparison.strategic_takeaway).toBeDefined();
  });
});
