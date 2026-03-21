import { NextResponse } from "next/server"

import { getScoringContractLogCount } from "@/protocol/contractLogStore"
import { getScoringProtocolCacheCount } from "@/protocol/requestCacheStore"

export async function GET() {
  const [activity_count, protocol_cache_count] = await Promise.all([
    getScoringContractLogCount(),
    getScoringProtocolCacheCount()
  ])

  return NextResponse.json({
    ok: true,
    system: "scoring",
    activity_count,
    protocol_cache_count
  })
}
