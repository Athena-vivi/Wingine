import {
  protocolScoreExport,
  protocolLoadWorkspace,
  protocolPersistWorkspace,
  protocolUpdateDimension,
  protocolWorkflowImport,
  protocolUpdateRoleInput
} from "./scoringProtocol.ts"
import type {
  CompositeProtocolName,
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolResponse,
  ScoreExportPayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload,
  WorkflowImportPayload
} from "../types/protocol.ts"

type CompositeResponse = ProtocolResponse<ScoringWorkspaceState | { saved: boolean } | Record<string, unknown>>

export function invokeWorkspaceProtocol(
  protocol: CompositeProtocolName,
  payload:
    | LoadWorkspacePayload
    | UpdateDimensionPayload
    | UpdateRolePayload
    | PersistWorkspacePayload
    | WorkflowImportPayload
    | ScoreExportPayload
): CompositeResponse {
  switch (protocol) {
    case "workspace_load":
    case "workspace_select":
      return protocolLoadWorkspace(payload as LoadWorkspacePayload)
    case "dimension_update":
      return protocolUpdateDimension(payload as UpdateDimensionPayload)
    case "role_update":
      return protocolUpdateRoleInput(payload as UpdateRolePayload)
    case "workspace_persist":
      return protocolPersistWorkspace(payload as PersistWorkspacePayload)
    case "workflow_import":
      return protocolWorkflowImport(payload as WorkflowImportPayload)
    case "score_export":
      return protocolScoreExport(payload as ScoreExportPayload)
    default:
      return {
        request_id: `workspace-${Date.now()}`,
        capability: protocol,
        status: "error",
        state: "error",
        data: null,
        error: {
          code: "protocol_not_found",
          message: "workspace protocol is not registered"
        }
      }
  }
}


