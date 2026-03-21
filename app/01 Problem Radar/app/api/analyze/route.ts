import { NextResponse } from "next/server"

import { resolveSourceInput } from "@/capabilities/sourceInputResolver"
import { resolveSourceMaterial } from "@/capabilities/sourceMaterialNormalizer"
import { analyzeReddit } from "@/lib/ai"
import type { AnalyzeRequestBody, RadarRecord } from "@/types/radar"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    const { sourceMode, normalizedInput } = resolveSourceInput(body)
    const { source, sourceMode: resolvedSourceMode } = await resolveSourceMaterial({
      sourceMode,
      normalizedInput
    })
    const result = await analyzeReddit(source, normalizedInput.notes || "")
    const radar: RadarRecord = {
      ...result.radar,
      source_type: resolvedSourceMode === "reddit" ? "community" : "manual",
      source_platform: resolvedSourceMode === "reddit" ? "reddit" : "manual"
    }

    return NextResponse.json({
      ...result,
      radar
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analyze route failed."
    const status = message.includes("Please provide") ? 400 : 500

    return NextResponse.json(
      {
        error: message
      },
      { status }
    )
  }
}
