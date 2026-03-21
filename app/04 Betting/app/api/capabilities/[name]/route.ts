import { NextResponse } from "next/server"

import { invokeCapability } from "@/protocol/capabilityInvoker"
import type { ProtocolRequest } from "@/types/protocol"

type RouteContext = {
  params: {
    name: string
  }
}

export async function POST(request: Request, context: RouteContext) {
  const body = (await request.json()) as Omit<ProtocolRequest, "capability">
  const response = invokeCapability({
    ...body,
    capability: context.params.name
  })

  return NextResponse.json(response, {
    status: response.status === "error" ? 400 : 200
  })
}
