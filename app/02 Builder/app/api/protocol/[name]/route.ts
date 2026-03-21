import { NextResponse } from "next/server"

import { appendBuilderContractLog } from "@/protocol/contractLogStore"
import {
  cacheBuilderProtocolResponse,
  getCachedBuilderProtocolResponse
} from "@/protocol/requestCacheStore"
import { invokeBuilderWorkspace } from "@/protocol/workspaceInvoker"
import type { BuilderProtocolRequest } from "@/types/protocol"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const body = (await request.json()) as BuilderProtocolRequest
  const { name } = await params
  const cachedResponse = typeof body.request_id === "string"
    ? await getCachedBuilderProtocolResponse(body.request_id, name)
    : null

  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      status: cachedResponse.status === "error" ? 400 : 200
    })
  }

  const response = await invokeBuilderWorkspace({
    ...body,
    capability: name as BuilderProtocolRequest["capability"]
  })

  if (typeof body.request_id === "string") {
    await cacheBuilderProtocolResponse(body.request_id, name, response)
  }

  await appendBuilderContractLog(name, response)

  return NextResponse.json(response)
}
