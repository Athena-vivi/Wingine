import { NextResponse } from "next/server"

import { appendScoringContractLog } from "@/protocol/contractLogStore"
import {
  cacheScoringProtocolResponse,
  getCachedScoringProtocolResponse
} from "@/protocol/requestCacheStore"
import { invokeWorkspaceProtocol } from "@/protocol/workspaceInvoker"
import type { CompositeProtocolName, ProtocolResponse } from "@/types/protocol"

type RouteContext = {
  params: {
    name: CompositeProtocolName
  }
}

export async function POST(request: Request, context: RouteContext) {
  const body = (await request.json()) as Record<string, unknown>
  const requestId = typeof body.request_id === "string" ? body.request_id : null
  const cachedResponse = requestId
    ? await getCachedScoringProtocolResponse(requestId, context.params.name)
    : null

  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      status: cachedResponse.status === "error" ? 400 : 200
    })
  }

  const response = invokeWorkspaceProtocol(context.params.name, body as never)

  if (requestId) {
    await cacheScoringProtocolResponse(requestId, context.params.name, response as ProtocolResponse<Record<string, unknown>>)
  }

  await appendScoringContractLog(context.params.name, response as ProtocolResponse<Record<string, unknown>>)

  return NextResponse.json(response, {
    status: response.status === "error" ? 400 : 200
  })
}
