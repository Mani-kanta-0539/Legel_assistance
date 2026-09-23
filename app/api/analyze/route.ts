import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/lib/ai/schemas";
import { screenLlmInput, screenLlmOutput } from "@/lib/security/llmFirewall";
import { analyzeContractWithGemini } from "@/lib/ai/geminiClient";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    
    // Strict runtime input validation via Zod
    const parseResult = AnalyzeRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issueMessage = parseResult.error.issues[0]?.message || "Invalid request payload format.";
      return NextResponse.json({ error: issueMessage }, { status: 400 });
    }

    const { contractText, apiKey, userIntent } = parseResult.data;

    // LAYER 1: LLM Firewall Input Screening
    const inputScan = screenLlmInput(contractText, "CONTRACT_DOCUMENT");

    if (!inputScan.allowed || inputScan.actionTaken === "BLOCKED") {
      return NextResponse.json(
        {
          error: "Security Firewall Alert: Critical adversarial instruction or jailbreak vector detected and blocked.",
          threats: inputScan.detectedThreats,
          riskScore: inputScan.riskScore,
          blocked: true,
        },
        { status: 400 }
      );
    }

    // Call Gemini with sanitized and delimited payload
    const result = await analyzeContractWithGemini(
      inputScan.sanitizedContent,
      apiKey,
      userIntent
    );

    // LAYER 2: LLM Firewall Output Validation & Exfiltration Defense
    const outputSerialized = JSON.stringify(result.data);
    const outputScan = screenLlmOutput(outputSerialized);

    const safeData = outputScan.safe
      ? result.data
      : JSON.parse(outputScan.sanitizedOutput);

    return NextResponse.json({
      success: true,
      report: safeData,
      source: result.source,
      model_used: result.model_used,
      latency_ms: result.latency_ms,
      warning: result.warning,
      firewall: {
        actionTaken: inputScan.actionTaken,
        riskScore: inputScan.riskScore,
        detectedThreats: inputScan.detectedThreats,
        outputSanitized: !outputScan.safe,
      },
    });
  } catch (error: any) {
    console.error("API /api/analyze error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal processing error during contract audit. Please retry." },
      { status: 500 }
    );
  }
}
