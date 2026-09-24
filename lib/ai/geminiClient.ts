import { z } from "zod";
import {
  ContractAuditReport,
  ContractComparisonReport,
  UserIntent,
} from "@/types";
import {
  ContractAuditReportSchema,
  ContractComparisonReportSchema,
} from "@/lib/ai/schemas";
import {
  SYSTEM_PROMPT_AUDITOR,
  SYSTEM_PROMPT_COMPARER,
  buildAuditUserPrompt,
  buildCompareUserPrompt,
} from "@/lib/ai/prompts";
import { runMockAudit, runMockCompare } from "@/lib/ai/mockEngine";

/**
 * Unified response envelope returned by all Gemini client functions.
 * Always indicates whether the result came from a live model or the mock fallback engine.
 */
export interface AnalysisResponse<T> {
  /** The parsed, schema-validated result payload. */
  data: T;
  /** Indicates whether the data was produced by a live Gemini model or the mock fallback. */
  source: "GEMINI_LIVE" | "MOCK_FALLBACK";
  /** Optional human-readable warning (e.g., truncation notice). */
  warning?: string;
  /** Name of the Gemini model that successfully responded. */
  model_used?: string;
  /** Total round-trip latency in milliseconds. */
  latency_ms?: number;
}

/** Raw part shape returned by the Gemini REST API candidates array. */
interface GeminiPart {
  text?: string;
  thought?: boolean;
}

/** Single candidate entry in a Gemini API response. */
interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

/** Top-level shape of a Gemini generateContent API response. */
interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

/**
 * Ordered list of Gemini model IDs to attempt.
 * Falls back to the next model on 4xx/5xx or timeout.
 */
const CANDIDATE_GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
] as const;

/** Maximum milliseconds to wait for a single Gemini model HTTP call (30 s < maxDuration 60 s). */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Robust JSON extractor that handles potential surrounding backticks or preamble text.
 */
function extractAndParseJson<T>(rawText: string, schema: z.ZodType<T>): T {
  let cleaned = rawText.trim();

  // Strip markdown code block if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
}

/**
 * Creates a fetch call with an AbortController timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Analyzes a contract document for legal risk using the Gemini API.
 *
 * Attempts each model in {@link CANDIDATE_GEMINI_MODELS} in order, applying an
 * AbortController timeout per attempt. Falls back to the deterministic mock
 * engine if no API key is present or all models fail.
 *
 * @param contractText - Raw contract text to analyze (up to 75 000 characters).
 * @param apiKey       - Optional Gemini API key; falls back to `GEMINI_API_KEY` env var.
 * @param userIntent   - Optional persona/focus directive for custom analysis.
 * @returns A promise resolving to a validated {@link ContractAuditReport} envelope.
 */
export async function analyzeContractWithGemini(
  contractText: string,
  apiKey?: string,
  userIntent?: UserIntent
): Promise<AnalysisResponse<ContractAuditReport>> {
  const activeKey = apiKey ?? process.env.GEMINI_API_KEY;

  if (!activeKey) {
    return {
      data: runMockAudit(contractText, userIntent),
      source: "MOCK_FALLBACK",
      warning:
        "Running in Zero-Config Demo Mode. Real-time Gemini API key not detected or omitted.",
    };
  }

  const startTime = Date.now();
  const userPrompt = buildAuditUserPrompt(contractText, userIntent);

  // Try candidate Gemini models in sequence
  for (const modelName of CANDIDATE_GEMINI_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT_AUDITOR }],
            },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens: 4096,
            },
          }),
        },
        REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(
          `Gemini model ${modelName} returned status ${response.status}: ${errText.slice(0, 120)}. Trying next candidate...`
        );
        continue;
      }

      const json: GeminiApiResponse = await response.json();
      const textPart =
        json?.candidates?.[0]?.content?.parts?.find(
          (p) => p.text && !p.thought
        ) ?? json?.candidates?.[0]?.content?.parts?.[0];

      const candidateText = textPart?.text;

      if (!candidateText) {
        console.warn(`Empty candidate text from ${modelName}. Trying next candidate...`);
        continue;
      }

      const validatedData = extractAndParseJson<ContractAuditReport>(
        candidateText,
        ContractAuditReportSchema
      );

      return {
        data: validatedData,
        source: "GEMINI_LIVE",
        model_used: modelName,
        latency_ms: Date.now() - startTime,
      };
    } catch (modelError: unknown) {
      const msg = modelError instanceof Error ? modelError.message : String(modelError);
      const isTimeout = modelError instanceof Error && modelError.name === "AbortError";
      console.warn(
        `Model ${modelName} ${isTimeout ? "timed out" : `error: ${msg}`}. Trying next candidate...`
      );
    }
  }

  // If all candidate models failed, fall back safely to deterministic engine
  return {
    data: runMockAudit(contractText, userIntent),
    source: "MOCK_FALLBACK",
    warning:
      "All Gemini model candidates encountered upstream rate limits or temporary unavailability. Switched to deterministic legal engine.",
  };
}

/**
 * Compares two contract drafts (Doc A vs Doc B) to identify legal risk drift.
 *
 * Performs a clause-by-clause diff using the Gemini API, classifying each change as
 * ADDED, REMOVED, MODIFIED, or UNCHANGED, and evaluating whether the risk shift is
 * ESCALATED, DE_ESCALATED, or NEUTRAL. Falls back to the mock engine on failure.
 *
 * @param docAName - Display name for the first (baseline) document.
 * @param docAText - Full text of the first document.
 * @param docBName - Display name for the second (revised) document.
 * @param docBText - Full text of the second document.
 * @param apiKey   - Optional Gemini API key; falls back to `GEMINI_API_KEY` env var.
 * @returns A promise resolving to a validated {@link ContractComparisonReport} envelope.
 */
export async function compareContractsWithGemini(
  docAName: string,
  docAText: string,
  docBName: string,
  docBText: string,
  apiKey?: string
): Promise<AnalysisResponse<ContractComparisonReport>> {
  const activeKey = apiKey ?? process.env.GEMINI_API_KEY;

  if (!activeKey) {
    return {
      data: runMockCompare(docAName, docAText, docBName, docBText),
      source: "MOCK_FALLBACK",
      warning:
        "Running in Zero-Config Demo Mode. Real-time Gemini API key not detected or omitted.",
    };
  }

  const startTime = Date.now();
  const userPrompt = buildCompareUserPrompt(docAName, docAText, docBName, docBText);

  for (const modelName of CANDIDATE_GEMINI_MODELS) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT_COMPARER }],
            },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens: 4096,
            },
          }),
        },
        REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        continue;
      }

      const json: GeminiApiResponse = await response.json();
      const textPart =
        json?.candidates?.[0]?.content?.parts?.find(
          (p) => p.text && !p.thought
        ) ?? json?.candidates?.[0]?.content?.parts?.[0];

      const candidateText = textPart?.text;

      if (!candidateText) {
        continue;
      }

      const validatedData = extractAndParseJson<ContractComparisonReport>(
        candidateText,
        ContractComparisonReportSchema
      );

      return {
        data: validatedData,
        source: "GEMINI_LIVE",
        model_used: modelName,
        latency_ms: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Compare candidate error:", modelName, msg);
    }
  }

  return {
    data: runMockCompare(docAName, docAText, docBName, docBText),
    source: "MOCK_FALLBACK",
    warning:
      "All Gemini comparison candidates failed. Switched to comparison fallback engine.",
  };
}
