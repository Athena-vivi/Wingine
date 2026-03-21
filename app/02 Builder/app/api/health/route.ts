import { NextResponse } from "next/server"

import { getBuilderContractLogCount } from "@/protocol/contractLogStore"
import { getBuilderProtocolCacheCount } from "@/protocol/requestCacheStore"
import { getBuilderRuntimeState } from "@/protocol/builderStateStore"

export async function GET() {
  const [activity_count, protocol_cache_count, runtime_state] = await Promise.all([
    getBuilderContractLogCount(),
    getBuilderProtocolCacheCount(),
    getBuilderRuntimeState()
  ])

  return NextResponse.json({
    ok: true,
    system: "builder",
    activity_count,
    protocol_cache_count,
    feedback_state_count: runtime_state.feedback_log.length
  })
}
