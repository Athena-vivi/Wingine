import {
  invokeScoringLoadWorkspace,
  invokeScoringPersistWorkspace,
  invokeScoringScoreExport,
  invokeScoringUpdateDimension,
  invokeScoringUpdateRoleInput,
  invokeScoringWorkflowImport
} from "./scoringProtocolInvocations.ts"
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

export function dispatchScoringLoadWorkspace(
  payload: LoadWorkspacePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return invokeScoringLoadWorkspace(payload)
}

export function dispatchScoringUpdateDimension(
  payload: UpdateDimensionPayload
): ProtocolResponse<ScoringWorkspaceState> {
  return invokeScoringUpdateDimension(payload)
}

export function dispatchScoringUpdateRoleInput(
  payload: UpdateRolePayload
): ProtocolResponse<ScoringWorkspaceState> {
  return invokeScoringUpdateRoleInput(payload)
}

export function dispatchScoringPersistWorkspace(
  payload: PersistWorkspacePayload
): ProtocolResponse<{ saved: boolean }> {
  return invokeScoringPersistWorkspace(payload)
}

export function dispatchScoringWorkflowImport(
  payload: WorkflowImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return invokeScoringWorkflowImport(payload)
}

export function dispatchScoringScoreExport(
  payload: ScoreExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return invokeScoringScoreExport(payload)
}
