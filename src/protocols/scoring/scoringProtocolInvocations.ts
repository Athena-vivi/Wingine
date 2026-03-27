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
import { createScoringProtocolRequest } from "./scoringProtocolRequest.ts"
import type {
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolResponse,
  ScoreExportPayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload,
  WorkflowImportPayload
} from "../../modules/capability/decision/scoring_module/types/protocol.ts"

export function invokeScoringLoadWorkspace(
  payload: LoadWorkspacePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringLoadWorkspaceWorkflow({
    payload,
    createRequest: createScoringProtocolRequest
  })
}

export function invokeScoringUpdateDimension(
  payload: UpdateDimensionPayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringUpdateDimensionWorkflow({
    payload,
    createRequest: createScoringProtocolRequest
  })
}

export function invokeScoringUpdateRoleInput(
  payload: UpdateRolePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return runScoringUpdateRoleWorkflow({
    payload,
    createRequest: createScoringProtocolRequest
  })
}

export function invokeScoringPersistWorkspace(
  payload: PersistWorkspacePayload
): ProtocolResponse<{ saved: boolean }> {
  return runScoringPersistWorkflow({
    payload,
    createRequest: createScoringProtocolRequest
  })
}

export function invokeScoringWorkflowImport(
  payload: WorkflowImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runScoringWorkflowImportProtocol(payload)
}

export function invokeScoringScoreExport(
  payload: ScoreExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runScoringScoreExportProtocol(payload)
}
