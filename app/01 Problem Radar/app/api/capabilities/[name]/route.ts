import { NextResponse } from "next/server"

import { invokeRadarCapability } from "@/protocol/capabilityInvoker"
import type { RadarProtocolRequest } from "@/types/protocol"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const body = (await request.json()) as RadarProtocolRequest
  const { name } = await params

  const response = await invokeRadarCapability({
    ...body,
    capability: name as RadarProtocolRequest["capability"]
  })

  return NextResponse.json(response)
}
