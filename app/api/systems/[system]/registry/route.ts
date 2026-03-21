import { NextResponse } from "next/server"

import { loadSystemRegistry } from "@/connectors/systems"
import type { SystemKey } from "@/types/console"

type RouteContext = {
  params: Promise<{
    system: SystemKey
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { system } = await context.params

  try {
    const registry = await loadSystemRegistry(system)
    return NextResponse.json(registry)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load system registry"
      },
      {
        status: 404
      }
    )
  }
}
