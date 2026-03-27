import {
  runBuilderCapabilityAttachmentWorkflow,
  runBuilderLoadWorkflow,
  runBuilderOutputUpdateWorkflow,
  runBuilderPersistWorkflow,
  runBuilderWorkflowLinkWorkflow,
  runBuilderWorkflowUpdateWorkflow
} from "../../workflows/builder/builderProtocolWorkflow.ts"
import {
  runBuilderBettingFeedbackProtocol,
  runBuilderProblemImportProtocol,
  runBuilderScoringFeedbackProtocol,
  runBuilderWorkflowExportProtocol
} from "./builderProtocolHandlers.ts"
import { buildBuilderToScoringWorkflowRequest, evaluateBuilderToScoringGate } from "../../modules/system/builder/builder/contracts/builderToScoring.ts"
import { importBetFeedbackToBuilder } from "../../modules/system/builder/builder/adapters/betFeedbackImportAdapter.ts"
import { importProblemObjectToBuilderProblem } from "../../modules/system/builder/builder/adapters/problemImportAdapter.ts"
import { importScoreFeedbackToBuilder } from "../../modules/system/builder/builder/adapters/scoreFeedbackImportAdapter.ts"
import { applyBetFeedbackToBuilderState, applyScoringFeedbackToBuilderState } from "../../modules/system/builder/builder/protocol/builderStateStore.ts"
import { exportWorkflowObjectFromBuilderWorkflow } from "../../modules/system/builder/builder/adapters/workflowExportAdapter.ts"
import { evaluateRadarToBuilderGate } from "../../modules/system/builder/builder/contracts/radarToBuilder.ts"
import type {
  BuilderProtocolRequest,
  BuilderProtocolResponse,
  BettingFeedbackImportPayload,
  ProblemImportPayload,
  ScoringFeedbackImportPayload,
  WorkflowExportPayload
} from "../../modules/system/builder/builder/types/protocol.ts"

export async function dispatchBuilderProtocol(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  try {
    switch (request.capability) {
      case "builder_load":
        return runBuilderLoadWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderLoadWorkflow>[0]["payload"]
        })
      case "workflow_update":
        return runBuilderWorkflowUpdateWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderWorkflowUpdateWorkflow>[0]["payload"]
        })
      case "workflow_link_update":
        return runBuilderWorkflowLinkWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderWorkflowLinkWorkflow>[0]["payload"]
        })
      case "capability_attachment_update":
        return runBuilderCapabilityAttachmentWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderCapabilityAttachmentWorkflow>[0]["payload"]
        })
      case "output_update":
        return runBuilderOutputUpdateWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderOutputUpdateWorkflow>[0]["payload"]
        })
      case "builder_persist":
        return runBuilderPersistWorkflow({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as Parameters<typeof runBuilderPersistWorkflow>[0]["payload"]
        })
      case "problem_import":
        return runBuilderProblemImportProtocol({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as ProblemImportPayload,
          importProblem: importProblemObjectToBuilderProblem,
          evaluateGate: evaluateRadarToBuilderGate
        })
      case "workflow_export":
        return runBuilderWorkflowExportProtocol({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as WorkflowExportPayload,
          exportWorkflow: (payload) =>
            exportWorkflowObjectFromBuilderWorkflow({
              workflow: payload.workflow,
              problem: payload.problem
            }) as Record<string, unknown>,
          buildRequest: (payload) =>
            buildBuilderToScoringWorkflowRequest({
              workflow: payload.workflow,
              problem: payload.problem
            }) as Record<string, unknown>,
          evaluateGate: (workflowObject) => evaluateBuilderToScoringGate(workflowObject as never) as Record<string, unknown>
        })
      case "scoring_to_builder_feedback":
        return runBuilderScoringFeedbackProtocol({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as ScoringFeedbackImportPayload,
          importFeedback: (score) => importScoreFeedbackToBuilder(score) as Record<string, unknown>,
          applyFeedback: async (feedback) => applyScoringFeedbackToBuilderState(feedback as never) as Promise<Record<string, unknown>>
        })
      case "betting_to_builder_feedback":
        return runBuilderBettingFeedbackProtocol({
          requestId: request.request_id,
          capability: request.capability,
          payload: request.payload as BettingFeedbackImportPayload,
          importFeedback: (bet) => importBetFeedbackToBuilder(bet) as Record<string, unknown>,
          applyFeedback: async (feedback) => applyBetFeedbackToBuilderState(feedback as never) as Promise<Record<string, unknown>>
        })
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
