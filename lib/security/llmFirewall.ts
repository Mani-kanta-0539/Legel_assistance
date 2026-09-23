/**
 * ClauseGuard Enterprise LLM Firewall & Security Middleware
 *
 * Implements a dual-layer defense architecture:
 * Layer 1 (Input Screening): Direct & indirect prompt injection detection,
 * delimiter-escape defense, base64 payload decoding inspection, token boundary caps,
 * and sandboxed XML isolation.
 * Layer 2 (Output Validation): Secret key leak prevention, canary token verification,
 * XSS/script sanitization, and output format integrity.
 */

export interface FirewallScanResult {
  allowed: boolean;
  actionTaken: "PASSED" | "FLAGGED_AND_SANITIZED" | "BLOCKED";
  riskScore: number; // 0 (pristine) to 100 (critical adversarial threat)
  detectedThreats: string[];
  sanitizedContent: string;
}

export interface OutputScanResult {
  safe: boolean;
  sanitizedOutput: string;
  blockedSecretsCount: number;
  warnings: string[];
}

// Adversarial prompt injection signatures (case-insensitive)
const DIRECT_INJECTION_SIGNATURES: Array<{ pattern: RegExp; description: string; severity: number }> = [
  { pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|commands)/i, description: "Instruction Override Attempt", severity: 90 },
  { pattern: /disregard\s+(all\s+)?(prior|previous|above)\s+(context|instructions|guidelines)/i, description: "Instruction Disregard Directive", severity: 90 },
  { pattern: /you\s+are\s+now\s+(in\s+)?(developer\s+mode|unrestricted|god\s+mode|dan\s+mode|jailbreak)/i, description: "Jailbreak Persona Shift", severity: 95 },
  { pattern: /system\s*(override|reset|shutdown|bypass)/i, description: "System Control Hijack Directive", severity: 85 },
  { pattern: /reveal\s+(your|the)\s+(system\s+prompt|initial\s+prompt|developer\s+instructions|secret\s+key|api\s+key)/i, description: "System Prompt Extraction Attack", severity: 85 },
  { pattern: /print\s+(the\s+)?(above|system)\s+(instructions|prompt|rules)/i, description: "Prompt Exfiltration Request", severity: 80 },
  { pattern: /output\s+the\s+system\s+instructions\s+verbatim/i, description: "Verbatim System Disclosure Attempt", severity: 85 },
  { pattern: /<\|im_start\|>|<\|im_end\|>|<<SYS>>|<\/s>|\[INST\]|\[\/INST\]/i, description: "ChatML / LLM Control Token Injection", severity: 95 },
  { pattern: /\[SYSTEM\s+NOTE\s*:[^\]]*\]/i, description: "Fake System Note Indirect Injection", severity: 75 },
  { pattern: /rate\s+this\s+(entire\s+)?document\s+as\s+(100%|green|safe|zero\s+risk|flawless)/i, description: "Score Manipulation Injection", severity: 70 },
  { pattern: /act\s+as\s+a\s+linux\s+terminal|execute\s+bash/i, description: "Command Shell Virtualization Jailbreak", severity: 75 },
];

// Delimiters that attackers attempt to close prematurely to breakout of input wrappers
const ESCAPE_TAGS = [
  /<\/untrusted_contract_text>/gi,
  /<\/contract_document>/gi,
  /<\/user_query>/gi,
  /<\/document_context>/gi,
];

// Secret key patterns to prevent data leakage in LLM completions
const SECRET_KEY_PATTERNS = [
  /AIza[0-9A-Za-z\-_]{35}/g, // Google API Key
  /AQ\.[0-9A-Za-z\-_]{40,60}/g, // Custom Gemini API Key format
  /sk-[A-Za-z0-9]{20,50}/g, // OpenAI/Standard Bearer token
  /ghp_[0-9a-zA-Z]{36}/g, // GitHub Personal Access Token
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi, // Bearer auth headers
];

// Script & XSS vectors in markdown/HTML
const XSS_VECTORS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on(click|error|load|mouseover)\s*=/gi,
];

/**
 * Checks if a string contains Base64 encoded payload that decodes to malicious injection directives.
 */
function inspectBase64Blocks(text: string): { found: boolean; decodedThreat?: string } {
  // Matches potential base64 segments longer than 24 chars
  const base64Regex = /\b[A-Za-z0-9+/]{24,}={0,2}\b/g;
  const matches = text.match(base64Regex) || [];

  for (const match of matches) {
    try {
      if (typeof atob === "function") {
        const decoded = atob(match);
        if (/ignore\s+previous|system\s+override|reveal\s+prompt|jailbreak/i.test(decoded)) {
          return { found: true, decodedThreat: decoded.slice(0, 50) };
        }
      } else {
        const decoded = Buffer.from(match, "base64").toString("utf-8");
        if (/ignore\s+previous|system\s+override|reveal\s+prompt|jailbreak/i.test(decoded)) {
          return { found: true, decodedThreat: decoded.slice(0, 50) };
        }
      }
    } catch {
      // Not valid base64 or decoding error - ignore
    }
  }
  return { found: false };
}

/**
 * LAYER 1: Comprehensive Input Screening & Sanitization
 */
export function screenLlmInput(
  rawInput: string,
  contextType: "CONTRACT_DOCUMENT" | "USER_QUERY" = "CONTRACT_DOCUMENT"
): FirewallScanResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      allowed: false,
      actionTaken: "BLOCKED",
      riskScore: 0,
      detectedThreats: ["Empty or non-string payload received."],
      sanitizedContent: "",
    };
  }

  const detectedThreats: string[] = [];
  let cumulativeRisk = 0;

  // 1. Strip raw control characters (excluding newline, tab, carriage return)
  let sanitized = rawInput.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Neutralize boundary tag breakout attempts
  for (const escapeTag of ESCAPE_TAGS) {
    if (escapeTag.test(sanitized)) {
      detectedThreats.push("Delimiter breakout attempt detected & neutralized.");
      cumulativeRisk += 40;
      sanitized = sanitized.replace(escapeTag, "[REDACTED_DELIMITER]");
    }
  }

  // 3. Scan for Direct & Indirect Prompt Injections
  for (const { pattern, description, severity } of DIRECT_INJECTION_SIGNATURES) {
    if (pattern.test(sanitized)) {
      detectedThreats.push(description);
      cumulativeRisk = Math.max(cumulativeRisk, severity);
      // Neutralize the injection text by wrapping in safe brackets
      sanitized = sanitized.replace(pattern, (match) => `[NEUTRALIZED_UNTRUSTED_INSTRUCTION: "${match.replace(/["\\]/g, "")}"]`);
    }
  }

  // 4. Base64 Obfuscation Analysis
  const b64Check = inspectBase64Blocks(rawInput);
  if (b64Check.found) {
    detectedThreats.push(`Obfuscated Base64 injection directive: "${b64Check.decodedThreat}..."`);
    cumulativeRisk = Math.max(cumulativeRisk, 90);
  }

  // 5. Length boundary enforcement
  const maxLimit = contextType === "CONTRACT_DOCUMENT" ? 75000 : 4000;
  if (sanitized.length > maxLimit) {
    sanitized = sanitized.slice(0, maxLimit);
    detectedThreats.push(`Input exceeded safe bounds; truncated to ${maxLimit.toLocaleString()} characters.`);
    cumulativeRisk = Math.max(cumulativeRisk, 20);
  }

  const riskScore = Math.min(100, cumulativeRisk);
  const isBlocked = riskScore >= 95; // Only reject outright if critical uncontainable jailbreak
  const actionTaken: "PASSED" | "FLAGGED_AND_SANITIZED" | "BLOCKED" = isBlocked
    ? "BLOCKED"
    : detectedThreats.length > 0
    ? "FLAGGED_AND_SANITIZED"
    : "PASSED";

  return {
    allowed: !isBlocked,
    actionTaken,
    riskScore,
    detectedThreats,
    sanitizedContent: sanitized.trim(),
  };
}

/**
 * Wraps untrusted text inside tamper-evident XML enclosures with clear isolation instructions.
 */
export function isolateWithXmlBoundary(
  content: string,
  tagName: "contract_document" | "user_query" | "document_context" = "contract_document"
): string {
  return `
<${tagName} data-integrity-mode="inert-payload">
${content}
</${tagName}>
`.trim();
}

/**
 * LAYER 2: Output Validation & Exfiltration Guard
 */
export function screenLlmOutput(rawOutput: string, canaryToken?: string): OutputScanResult {
  if (!rawOutput || typeof rawOutput !== "string") {
    return {
      safe: true,
      sanitizedOutput: "",
      blockedSecretsCount: 0,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  let sanitized = rawOutput;
  let blockedSecrets = 0;

  // 1. Canary Token Check (detects if system prompt instructions were regurgitated)
  if (canaryToken && sanitized.includes(canaryToken)) {
    warnings.push("CRITICAL: Canary token identified in model completion. System prompt leak prevented.");
    sanitized = sanitized.split(canaryToken).join("[SYSTEM_CANARY_REDACTED]");
  }

  // 2. Secret Key and Token Scrubbing
  for (const secretRegex of SECRET_KEY_PATTERNS) {
    if (secretRegex.test(sanitized)) {
      blockedSecrets++;
      warnings.push("Secret key pattern detected in model output and redacted.");
      sanitized = sanitized.replace(secretRegex, "[CONFIDENTIAL_KEY_REDACTED]");
    }
  }

  // 3. XSS and Malicious Script Elimination
  for (const xssPattern of XSS_VECTORS) {
    if (xssPattern.test(sanitized)) {
      warnings.push("Potential XSS vector or raw script tag removed from model output.");
      sanitized = sanitized.replace(xssPattern, "[SCRIPT_REMOVED]");
    }
  }

  return {
    safe: blockedSecrets === 0 && warnings.length === 0,
    sanitizedOutput: sanitized,
    blockedSecretsCount: blockedSecrets,
    warnings,
  };
}
