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

export interface AnalysisResponse<T> {
  data: T;
  source: "GEMINI_LIVE" | "MOCK_FALLBACK";
  warning?: string;
  model_used?: string;
  latency_ms?: number;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

/** Candidate model cascade — ordered by latency/capability preference */
const CANDIDATE_GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
] as const;

/** Per-request timeout in milliseconds (30 s keeps well under maxDuration=60) */
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
 * Analyzes a contract using either the Gemini API (if key provided) or mock engine.
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
 * Compares two contract versions using Gemini or fallback.
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
