import { NextResponse } from "next/server"

import { appendBettingContractLog } from "@/protocol/contractLogStore"
import {
  cacheBettingProtocolResponse,
  getCachedBettingProtocolResponse
} from "@/protocol/requestCacheStore"
import { invokeWorkspaceProtocol } from "@/protocol/workspaceInvoker"
import type { BettingCompositeProtocol } from "@/types/protocol"

type RouteContext = {
  params: {
    name: BettingCompositeProtocol
  }
}

export async function POST(request: Request, context: RouteContext) {
  const body = (await request.json()) as Record<string, unknown>
  const requestId = typeof body.request_id === "string" ? body.request_id : null
  const cachedResponse = requestId
    ? await getCachedBettingProtocolResponse(requestId, context.params.name)
    : null

  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      status: cachedResponse.status === "error" ? 400 : 200
    })
  }

  const response = invokeWorkspaceProtocol(context.params.name, body as never)

  if (requestId) {
    await cacheBettingProtocolResponse(
      requestId,
      context.params.name,
      response as import("@/types/protocol").ProtocolResponse<Record<string, unknown>>
    )
  }

  await appendBettingContractLog(
    context.params.name,
    response as import("@/types/protocol").ProtocolResponse<Record<string, unknown>>
  )

  return NextResponse.json(response, {
    status: response.status === "error" ? 400 : 200
  })
}
