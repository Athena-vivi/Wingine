import { NextResponse } from "next/server"

import { upsertRadarRecordCapability } from "@/capabilities/radarRecordUpsertor"
import type { RadarRecord } from "@/types/radar"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { radarRecord?: RadarRecord }

    if (!body.radarRecord?.source_url) {
      return NextResponse.json({ error: "radarRecord.source_url is required." }, { status: 400 })
    }

    const result = await upsertRadarRecordCapability(body.radarRecord)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Radar route failed."
      },
      { status: 500 }
    )
  }
}
