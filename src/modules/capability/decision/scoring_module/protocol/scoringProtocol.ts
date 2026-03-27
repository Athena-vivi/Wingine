import {
  dispatchScoringLoadWorkspace,
  dispatchScoringPersistWorkspace,
  dispatchScoringScoreExport,
  dispatchScoringUpdateDimension,
  dispatchScoringUpdateRoleInput,
  dispatchScoringWorkflowImport
} from "../../../../../protocols/scoring/scoringProtocolDispatch.ts"
import type {
  LoadWorkspacePayload,
  ProtocolResponse,
  ScoreExportPayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload,
  WorkflowImportPayload
} from "../types/protocol.ts"
import type { PersistWorkspacePayload } from "../types/protocol.ts"

export function protocolLoadWorkspace(
  payload: LoadWorkspacePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return dispatchScoringLoadWorkspace(payload)
}

export function protocolUpdateDimension(
  payload: UpdateDimensionPayload
): ProtocolResponse<ScoringWorkspaceState> {
  return dispatchScoringUpdateDimension(payload)
}

export function protocolUpdateRoleInput(
  payload: UpdateRolePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return dispatchScoringUpdateRoleInput(payload)
}

export function protocolPersistWorkspace(
  payload: PersistWorkspacePayload
): ProtocolResponse<{ saved: boolean }> {
  return dispatchScoringPersistWorkspace(payload)
}

export function protocolWorkflowImport(
  payload: WorkflowImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return dispatchScoringWorkflowImport(payload)
}

export function protocolScoreExport(
  payload: ScoreExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return dispatchScoringScoreExport(payload)
}




