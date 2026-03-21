import { NextResponse } from "next/server"

import { getBettingContractLogCount } from "@/protocol/contractLogStore"
import { getBettingProtocolCacheCount } from "@/protocol/requestCacheStore"

export async function GET() {
  const [activity_count, protocol_cache_count] = await Promise.all([
    getBettingContractLogCount(),
    getBettingProtocolCacheCount()
  ])

  return NextResponse.json({
    ok: true,
    system: "betting",
    activity_count,
    protocol_cache_count
  })
}
