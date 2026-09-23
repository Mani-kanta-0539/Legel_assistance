import { NextRequest, NextResponse } from "next/server";
import { CompareRequestSchema } from "@/lib/ai/schemas";
import { screenLlmInput, screenLlmOutput } from "@/lib/security/llmFirewall";
import { compareContractsWithGemini } from "@/lib/ai/geminiClient";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    const parseResult = CompareRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issueMessage = parseResult.error.issues[0]?.message || "Invalid comparison request format.";
      return NextResponse.json({ error: issueMessage }, { status: 400 });
    }

    const { docAName, docAText, docBName, docBText, apiKey } = parseResult.data;

    // LAYER 1: LLM Firewall Input Screening
    const scanA = screenLlmInput(docAText, "CONTRACT_DOCUMENT");
    const scanB = screenLlmInput(docBText, "CONTRACT_DOCUMENT");

    if (!scanA.allowed || scanA.actionTaken === "BLOCKED") {
      return NextResponse.json(
        {
          error: "Security Firewall Alert: Document A contains critical adversarial injection directives and was blocked.",
          threats: scanA.detectedThreats,
          blocked: true,
        },
        { status: 400 }
      );
    }

    if (!scanB.allowed || scanB.actionTaken === "BLOCKED") {
      return NextResponse.json(
        {
          error: "Security Firewall Alert: Document B contains critical adversarial injection directives and was blocked.",
          threats: scanB.detectedThreats,
          blocked: true,
        },
        { status: 400 }
      );
    }

    const result = await compareContractsWithGemini(
      docAName || "Document A",
      scanA.sanitizedContent,
      docBName || "Document B",
      scanB.sanitizedContent,
      apiKey
    );

    // LAYER 2: LLM Firewall Output Screening
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
        threatsFound: [...scanA.detectedThreats, ...scanB.detectedThreats],
        outputCleaned: !outputScan.safe,
      },
    });
  } catch (error: any) {
    console.error("API /api/compare error:", error?.message || error);
    return NextResponse.json(
      { error: "Internal processing error during contract version comparison." },
      { status: 500 }
    );
  }
}
