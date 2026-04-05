import { invokeBuilderCapability } from "./capabilityInvoker.ts"
import { runBuilderProtocol } from "./builderProtocol.ts"
import type { BuilderProtocolRequest, BuilderProtocolResponse } from "../types/protocol.ts"

const protocolNames = new Set([
  "builder_load",
  "workflow_update",
  "workflow_link_update",
  "capability_attachment_update",
  "output_update",
  "builder_persist",
  "problem_import",
  "workflow_export",
  "scoring_to_builder_feedback",
  "betting_to_builder_feedback"
])

export function invokeBuilderWorkspace(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  if (protocolNames.has(request.capability)) {
    return runBuilderProtocol(request)
  }

  return Promise.resolve(invokeBuilderCapability(request))
}


