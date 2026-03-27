import {
  runScoringLoadWorkspaceWorkflow,
  runScoringPersistWorkflow,
  runScoringUpdateDimensionWorkflow,
  runScoringUpdateRoleWorkflow
} from "../../workflows/scoring/scoringProtocolWorkflow.ts"
import {
  runScoringScoreExportProtocol,
  runScoringWorkflowImportProtocol
} from "./scoringProtocolHandlers.ts"
import type {
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolCaller,
  ProtocolRequest,
  ProtocolResponse,
  ScoreExportPayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload,
  WorkflowImportPayload
} from "../../modules/capability/decision/scoring_module/types/protocol.ts"

const defaultCaller: ProtocolCaller = {
  type: "human-ui",
  id: "scoring-interface"
}

function createRequest<TPayload>(
  capability: string,
  payload: TPayload,
  context: ProtocolRequest<TPayload>["context"]
): ProtocolRequest<TPayload> {
  return {
    request_id: `${capability}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    capability,
    caller: defaultCaller,
    payload,
    context
  }
}

export function dispatchScoringLoadWorkspace(
  payload: LoadWorkspacePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringLoadWorkspaceWorkflow({
    payload,
    createRequest
  })
}

export function dispatchScoringUpdateDimension(
  payload: UpdateDimensionPayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringUpdateDimensionWorkflow({
    payload,
    createRequest
  })
}

export function dispatchScoringUpdateRoleInput(
  payload: UpdateRolePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringUpdateRoleWorkflow({
    payload,
    createRequest
  })
}

export function dispatchScoringPersistWorkspace(
  payload: PersistWorkspacePayload
): ProtocolResponse<{ saved: boolean }> {
  return runScoringPersistWorkflow({
    payload,
    createRequest
  })
}

export function dispatchScoringWorkflowImport(
  payload: WorkflowImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runScoringWorkflowImportProtocol(payload)
}

export function dispatchScoringScoreExport(
  payload: ScoreExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runScoringScoreExportProtocol(payload)
}
