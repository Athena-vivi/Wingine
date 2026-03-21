import { NextResponse } from "next/server"

import { getRadarContractLogCount } from "@/protocol/contractLogStore"
import { getRadarProtocolCacheCount } from "@/protocol/requestCacheStore"
import { getRadarRuntimeState } from "@/protocol/radarStateStore"

export async function GET() {
  const [activity_count, protocol_cache_count, runtime_state] = await Promise.all([
    getRadarContractLogCount(),
    getRadarProtocolCacheCount(),
    getRadarRuntimeState()
  ])

  return NextResponse.json({
    ok: true,
    system: "radar",
    activity_count,
    protocol_cache_count,
    feedback_state_count: runtime_state.feedback_log.length
  })
}
