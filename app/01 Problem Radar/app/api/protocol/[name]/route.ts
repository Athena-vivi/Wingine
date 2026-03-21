import { NextResponse } from "next/server"

import { appendRadarContractLog } from "@/protocol/contractLogStore"
import {
  cacheRadarProtocolResponse,
  getCachedRadarProtocolResponse
} from "@/protocol/requestCacheStore"
import { invokeRadarWorkspace } from "@/protocol/workspaceInvoker"
import type { RadarProtocolRequest } from "@/types/protocol"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const body = (await request.json()) as RadarProtocolRequest
  const { name } = await params
  const cachedResponse = typeof body.request_id === "string"
    ? await getCachedRadarProtocolResponse(body.request_id, name)
    : null

  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      status: cachedResponse.status === "error" ? 400 : 200
    })
  }

  const response = await invokeRadarWorkspace({
    ...body,
    capability: name as RadarProtocolRequest["capability"]
  })

  if (typeof body.request_id === "string") {
    await cacheRadarProtocolResponse(body.request_id, name, response)
  }

  await appendRadarContractLog(name, response)

  return NextResponse.json(response)
}
