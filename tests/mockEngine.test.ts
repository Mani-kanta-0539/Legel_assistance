import { describe, it, expect } from "vitest";
import { runMockAudit, runMockCompare } from "../lib/ai/mockEngine";
import { SAMPLE_PRESETS, COMPARE_PRESETS } from "../lib/presets/sampleContracts";
import { ContractAuditReportSchema, ContractComparisonReportSchema } from "../lib/ai/schemas";

describe("Mock AI & Heuristic Evaluation Engine", () => {
  it("should evaluate Predatory Freelance SOW with high risk score and valid Zod schema", () => {
    const freelancePreset = SAMPLE_PRESETS.find((p) => p.id === "predatory-freelance")!;
    const report = runMockAudit(freelancePreset.content);

    // Validate using Zod schema
    const parseResult = ContractAuditReportSchema.safeParse(report);
    expect(parseResult.success).toBe(true);

    expect(report.overall_risk_score).toBeGreaterThanOrEqual(80);
    expect(report.risk_tier).toBe("CRITICAL");
    expect(report.triage_recommendation).toBe("CONSULT_ATTORNEY_BEFORE_SIGNING");
    expect(report.summary_stats.red_flags).toBeGreaterThanOrEqual(3);

    // Verify counter proposals and lawyer questions exist
    expect(report.clauses.some((c) => c.counter_proposal !== undefined)).toBe(true);
    expect(report.attorney_dossier.top_5_attorney_questions.length).toBe(5);
  });

  it("should evaluate Aggressive Lease with habitability and deposit flags", () => {
    const leasePreset = SAMPLE_PRESETS.find((p) => p.id === "aggressive-residential-lease")!;
    const report = runMockAudit(leasePreset.content);

    const parseResult = ContractAuditReportSchema.safeParse(report);
    expect(parseResult.success).toBe(true);

    expect(report.risk_tier).toBe("HIGH");
    expect(report.clauses.some((c) => c.category === "WARRANTY_HABITABILITY")).toBe(true);
  });

  it("should evaluate Prompt Injection attack without getting compromised", () => {
    const injectionPreset = SAMPLE_PRESETS.find((p) => p.id === "prompt-injection-attack-sample")!;
    const report = runMockAudit(injectionPreset.content);

    expect(report.overall_risk_score).toBeGreaterThan(80);
    expect(report.risk_tier).toBe("CRITICAL");
    // Ensure it flagged the injection attempt as a red clause
    expect(report.clauses.some((c) => c.clause_id === "clause_injection_defense")).toBe(true);
  });

  it("should perform comparison diff on lease drafts and validate schema", () => {
    const leaseCompare = COMPARE_PRESETS[0];
    const diffReport = runMockCompare(
      leaseCompare.docA.name,
      leaseCompare.docA.content,
      leaseCompare.docB.name,
      leaseCompare.docB.content
    );

    const parseResult = ContractComparisonReportSchema.safeParse(diffReport);
    expect(parseResult.success).toBe(true);

    expect(diffReport.differences.length).toBeGreaterThanOrEqual(2);
    expect(diffReport.differences.some((d) => d.risk_shift === "ESCALATED")).toBe(true);
  });
});
