import { invokeRadarCapability } from "@/protocol/capabilityInvoker"
import { runRadarProtocol } from "@/protocol/radarProtocol"
import type { RadarProtocolRequest, RadarProtocolResponse } from "@/types/protocol"

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
