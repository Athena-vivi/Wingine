import { NextResponse } from "next/server"

import { runContentGeneration } from "@/capabilities/contentGenerationEngine"
import type { GenerateRequestBody } from "@/types/radar"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody

    if (!body.insight?.trim()) {
      return NextResponse.json({ error: "Insight is required." }, { status: 400 })
    }

    const result = await runContentGeneration({
      insight: body.insight.trim(),
      radarRecord: body.radarRecord
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generate route failed."
      },
      { status: 500 }
    )
  }
}
