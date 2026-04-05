import {
  invokeBuilderBettingFeedback,
  invokeBuilderCapabilityAttachment,
  invokeBuilderLoad,
  invokeBuilderOutputUpdate,
  invokeBuilderPersist,
  invokeBuilderProblemImport,
  invokeBuilderScoringFeedback,
  invokeBuilderWorkflowExport,
  invokeBuilderWorkflowLink,
  invokeBuilderWorkflowUpdate
} from "./builderProtocolInvocations.ts"
import type { BuilderProtocolRequest, BuilderProtocolResponse } from "../../modules/system/builder/builder/types/protocol.ts"

export async function dispatchBuilderProtocol(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  try {
    switch (request.capability) {
      case "builder_load":
        return invokeBuilderLoad(request)
      case "workflow_update":
        return invokeBuilderWorkflowUpdate(request)
      case "workflow_link_update":
        return invokeBuilderWorkflowLink(request)
      case "capability_attachment_update":
        return invokeBuilderCapabilityAttachment(request)
      case "output_update":
        return invokeBuilderOutputUpdate(request)
      case "builder_persist":
        return invokeBuilderPersist(request)
      case "problem_import":
        return invokeBuilderProblemImport(request)
      case "workflow_export":
        return invokeBuilderWorkflowExport(request)
      case "scoring_to_builder_feedback":
        return invokeBuilderScoringFeedback(request)
      case "betting_to_builder_feedback":
        return invokeBuilderBettingFeedback(request)
      default:
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "error",
          state: "error",
          data: null,
          error: {
            code: "protocol_not_found",
            message: `Unknown builder protocol: ${request.capability}`
          }
        }
    }
  } catch (error) {
    return {
      request_id: request.request_id,
      capability: request.capability,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "protocol_invocation_failed",
        message: error instanceof Error ? error.message : "Builder protocol invocation failed."
      }
    }
  }
}
