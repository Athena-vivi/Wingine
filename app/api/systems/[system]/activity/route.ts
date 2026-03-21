import { NextResponse } from "next/server"

import type { SystemKey } from "@/types/console"

type RouteContext = {
  params: Promise<{
    system: SystemKey
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { system } = await context.params

  const endpointMap: Record<SystemKey, string> = {
    radar: "http://localhost:3001/api/activity",
    builder: "http://localhost:3002/api/activity",
    scoring: "http://localhost:3003/api/activity",
    betting: "http://localhost:3004/api/activity"
  }

  const endpoint = endpointMap[system]

  try {
    const response = await fetch(endpoint, {
      cache: "no-store"
    })

    if (!response.ok) {
      return NextResponse.json({ system, events: [] }, { status: 200 })
    }

    const payload = (await response.json()) as unknown
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ system, events: [] }, { status: 200 })
  }
}
