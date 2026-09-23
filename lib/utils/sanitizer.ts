/**
 * Sanitizer and security hygiene utilities for ClauseGuard.
 * Defends against indirect prompt injection and cleans raw input text.
 * Powered by ClauseGuard Enterprise LLM Firewall.
 */

import { screenLlmInput } from "@/lib/security/llmFirewall";

export const MAX_CONTRACT_LENGTH = 75000; // ~15,000 words max per single run

export function sanitizeContractInput(rawText: string): {
  cleanedText: string;
  isTruncated: boolean;
  warnings: string[];
  riskScore: number;
} {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return {
      cleanedText: "",
      isTruncated: false,
      warnings: ["Empty document provided."],
      riskScore: 0,
    };
  }

  // 1. Strip raw control characters (excluding newline, tab, carriage return)
  let preCleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Scan via Enterprise Firewall
  const scan = screenLlmInput(preCleaned, "CONTRACT_DOCUMENT");

  const warnings: string[] = [];

  if (scan.detectedThreats.length > 0) {
    warnings.push(
      "Heuristic Alert: Contract text contains potential instruction-override sequences. ClauseGuard's sandboxed evaluator isolated these to prevent skewed scoring."
    );
    warnings.push(...scan.detectedThreats);
  }

  let cleaned = preCleaned.trim();
  let isTruncated = false;
  if (cleaned.length > MAX_CONTRACT_LENGTH) {
    cleaned = cleaned.slice(0, MAX_CONTRACT_LENGTH);
    isTruncated = true;
    warnings.push(
      `Document truncated to ${MAX_CONTRACT_LENGTH.toLocaleString()} characters for processing limits.`
    );
  }

  return {
    cleanedText: cleaned,
    isTruncated,
    warnings,
    riskScore: scan.riskScore,
  };
}

/**
 * Wraps untrusted contract text in strict sandboxing XML tags for LLM ingestion.
 * This instructs the model to treat the content purely as inert data, never instructions.
 */
export function wrapInUntrustedBoundary(contractText: string): string {
  return `
<untrusted_contract_text>
${contractText}
</untrusted_contract_text>
`.trim();
}
