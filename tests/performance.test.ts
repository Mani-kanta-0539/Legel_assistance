import { describe, it, expect } from "vitest";
import { runMockAudit, runMockCompare } from "../lib/ai/mockEngine";
import { SAMPLE_PRESETS, COMPARE_PRESETS } from "../lib/presets/sampleContracts";

/**
 * Performance & Efficiency Tests
 *
 * Validates that the deterministic legal engine operates well within
 * acceptable time bounds for UI responsiveness (sub-100ms for mock, sub-500ms for batch).
 */
describe("Engine Performance & Efficiency", () => {
  it("should complete a single contract audit in under 100ms", () => {
    const preset = SAMPLE_PRESETS[0];
    const start = performance.now();
    runMockAudit(preset.content);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("should complete a batch of 5 audits in under 500ms", () => {
    const start = performance.now();
    for (const preset of SAMPLE_PRESETS) {
      runMockAudit(preset.content);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  it("should complete a comparison diff in under 100ms", () => {
    const preset = COMPARE_PRESETS[0];
    const start = performance.now();
    runMockCompare(
      preset.docA.name,
      preset.docA.content,
      preset.docB.name,
      preset.docB.content
    );
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("should return consistent results across repeated calls (determinism)", () => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === "predatory-freelance")!;
    const report1 = runMockAudit(preset.content);
    const report2 = runMockAudit(preset.content);

    expect(report1.overall_risk_score).toBe(report2.overall_risk_score);
    expect(report1.risk_tier).toBe(report2.risk_tier);
    expect(report1.clauses.length).toBe(report2.clauses.length);
  });

  it("should not crash or throw on extremely short contract text", () => {
    expect(() => runMockAudit("x")).not.toThrow();
  });

  it("should not crash or throw on an empty string contract", () => {
    expect(() => runMockAudit("")).not.toThrow();
  });

  it("should return a valid report structure on minimal input", () => {
    const report = runMockAudit("This is a one-line agreement.");
    expect(report.document_title).toBeDefined();
    expect(report.overall_risk_score).toBeGreaterThanOrEqual(0);
    expect(report.clauses).toBeInstanceOf(Array);
    expect(report.attorney_dossier).toBeDefined();
  });
});
