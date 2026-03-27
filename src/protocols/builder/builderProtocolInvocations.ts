import {
  runBuilderCapabilityAttachmentWorkflow,
  runBuilderLoadWorkflow,
  runBuilderOutputUpdateWorkflow,
  runBuilderPersistWorkflow,
  runBuilderWorkflowLinkWorkflow,
  runBuilderWorkflowUpdateWorkflow
} from "../../workflows/builder/builderProtocolWorkflow.ts"
import {
  runBuilderProblemImportProtocol,
  runBuilderWorkflowExportProtocol
} from "./builderProtocolHandlers.ts"
import {
  runBuilderBettingFeedbackWorkflow,
  runBuilderScoringFeedbackWorkflow
} from "../../workflows/builder/builderFeedbackWorkflow.ts"
import { buildBuilderToScoringWorkflowRequest, evaluateBuilderToScoringGate } from "../../modules/system/builder/builder/contracts/builderToScoring.ts"
import { evaluateRadarToBuilderGate } from "../../modules/system/builder/builder/contracts/radarToBuilder.ts"
import { importProblemObjectToBuilderProblem } from "../../modules/system/builder/builder/adapters/problemImportAdapter.ts"
import { exportWorkflowObjectFromBuilderWorkflow } from "../../modules/system/builder/builder/adapters/workflowExportAdapter.ts"
import type {
  BuilderProtocolRequest,
  BuilderProtocolResponse,
  ProblemImportPayload,
  WorkflowExportPayload
} from "../../modules/system/builder/builder/types/protocol.ts"

export function invokeBuilderLoad(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderLoadWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderLoadWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderLoadWorkflow>[0]["payload"]
  })
}

export function invokeBuilderWorkflowUpdate(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderWorkflowUpdateWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderWorkflowUpdateWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderWorkflowUpdateWorkflow>[0]["payload"]
  })
}

export function invokeBuilderWorkflowLink(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderWorkflowLinkWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderWorkflowLinkWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderWorkflowLinkWorkflow>[0]["payload"]
  })
}

export function invokeBuilderCapabilityAttachment(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderCapabilityAttachmentWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderCapabilityAttachmentWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderCapabilityAttachmentWorkflow>[0]["payload"]
  })
}

export function invokeBuilderOutputUpdate(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderOutputUpdateWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderOutputUpdateWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderOutputUpdateWorkflow>[0]["payload"]
  })
}

export function invokeBuilderPersist(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> | BuilderProtocolResponse<Record<string, unknown>> {
  return runBuilderPersistWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderPersistWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderPersistWorkflow>[0]["payload"]
  })
}

export function invokeBuilderProblemImport(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return runBuilderProblemImportProtocol({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderProblemImportProtocol>[0]["capability"],
    payload: request.payload as ProblemImportPayload,
    importProblem: importProblemObjectToBuilderProblem,
    evaluateGate: evaluateRadarToBuilderGate
  })
}

export function invokeBuilderWorkflowExport(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return runBuilderWorkflowExportProtocol({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderWorkflowExportProtocol>[0]["capability"],
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
}

export function invokeBuilderScoringFeedback(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return runBuilderScoringFeedbackWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderScoringFeedbackWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderScoringFeedbackWorkflow>[0]["payload"]
  })
}

export function invokeBuilderBettingFeedback(
  request: BuilderProtocolRequest
): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return runBuilderBettingFeedbackWorkflow({
    requestId: request.request_id,
    capability: request.capability as Parameters<typeof runBuilderBettingFeedbackWorkflow>[0]["capability"],
    payload: request.payload as Parameters<typeof runBuilderBettingFeedbackWorkflow>[0]["payload"]
  })
}
