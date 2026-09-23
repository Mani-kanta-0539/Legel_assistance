import { describe, it, expect } from "vitest";
import { runMockAudit, runMockCompare } from "../lib/ai/mockEngine";
import { SAMPLE_PRESETS, COMPARE_PRESETS } from "../lib/presets/sampleContracts";
import {
  generateAuditMarkdown,
  generateComparisonMarkdown,
  generateAttorneyDossierPdf,
} from "../lib/utils/exporter";

describe("Exporter & Report Generation", () => {
  it("should generate a complete, well-formatted Markdown audit report", () => {
    const preset = SAMPLE_PRESETS[0];
    const report = runMockAudit(preset.content);
    const md = generateAuditMarkdown(report);

    expect(md).toContain("# ClauseGuard Contract Audit Report");
    expect(md).toContain("LEGAL DISCLAIMER");
    expect(md).toContain("Executive Summary");
    expect(md).toContain("Top 5 Strategic Questions for Attorney Consultation");
    expect(md).toContain("Recommended Counter-Proposal");
    expect(md).toContain("Counterparty Pushback Email Script");
  });

  it("should generate a comparison Markdown report", () => {
    const comparePreset = COMPARE_PRESETS[0];
    const diffReport = runMockCompare(
      comparePreset.docA.name,
      comparePreset.docA.content,
      comparePreset.docB.name,
      comparePreset.docB.content
    );

    const md = generateComparisonMarkdown(diffReport);
    expect(md).toContain("# ClauseGuard Contract Comparison Audit");
    expect(md).toContain("## Verdict");
    expect(md).toContain("## Strategic Takeaway");
    expect(md).toContain("## Clause Differences");
  });

  it("should generate an executive attorney dossier PDF without errors", () => {
    const preset = SAMPLE_PRESETS[0];
    const report = runMockAudit(preset.content, {
      role: "Freelance Software Engineer",
      focusAreas: ["IP_OWNERSHIP", "LIABILITY_INDEMNITY"],
      customQuestion: "Can they claim ownership of my personal libraries?",
    });

    // Mock doc.save to verify PDF construction in test environment
    expect(() => {
      generateAttorneyDossierPdf(report);
    }).not.toThrow();
  });
});
