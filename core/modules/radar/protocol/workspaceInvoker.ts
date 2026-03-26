import { invokeRadarCapability } from "./capabilityInvoker.ts"
import { runRadarProtocol } from "./radarProtocol.ts"
import type { RadarProtocolRequest, RadarProtocolResponse } from "../types/protocol.ts"

const protocolNames = new Set([
  "workspace_load",
  "source_analyze",
  "radar_save",
  "content_generate",
  "content_rewrite",
  "problem_export",
  "scoring_to_radar_feedback",
  "betting_to_radar_feedback"
])

export async function invokeRadarWorkspace(
  request: RadarProtocolRequest
): Promise<RadarProtocolResponse<Record<string, unknown>>> {
  if (protocolNames.has(request.capability)) {
    return runRadarProtocol(request)
  }

  return invokeRadarCapability(request)
}


