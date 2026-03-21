import { NextResponse } from "next/server"

import { invokeBuilderCapability } from "@/protocol/capabilityInvoker"
import type { BuilderProtocolRequest } from "@/types/protocol"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const body = (await request.json()) as BuilderProtocolRequest
  const { name } = await params

  const response = invokeBuilderCapability({
    ...body,
    capability: name as BuilderProtocolRequest["capability"]
  })

  return NextResponse.json(response)
}
