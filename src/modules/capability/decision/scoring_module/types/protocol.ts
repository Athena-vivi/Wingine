import type { FlowRequest, FlowResponse, ScoreObject, WorkflowObject } from "../../../../../contracts/index.ts"
import type {
  CapabilityDefinition as BaseCapabilityDefinition,
  CapabilityCallerType,
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolCaller as BaseProtocolCaller,
  ProtocolRequest as BaseProtocolRequest,
  ProtocolResponse as BaseProtocolResponse,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload
} from "../../../../../contracts/index.ts"
import type {
  EvaluationRecord,
  ScoringObject,
  ScoringObjectType
} from "./scoring.ts"
export type {
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload
} from "../../../../../contracts/index.ts"

export type CapabilityState =
  | "idle"
  | "loading"
  | "validating"
  | "creating"
  | "updating"
  | "persisting"
  | "aggregating"
  | "evaluating"
  | "ready"
  | "updated"
  | "error"

export type ProtocolCaller = BaseProtocolCaller<CapabilityCallerType>

export type ProtocolContext = {
  objectId?: string
  objectType?: ScoringObjectType
  evaluationId?: string
}

export type CapabilityDefinition = BaseCapabilityDefinition

export type ProtocolRequest<TPayload = Record<string, unknown>> = BaseProtocolRequest<
  TPayload,
  ProtocolContext
>

export type ProtocolResponse<TData = Record<string, unknown>> = BaseProtocolResponse<
  TData,
  CapabilityState
>

export type CompositeProtocolName =
  | "workspace_load"
  | "workspace_select"
  | "dimension_update"
  | "role_update"
  | "workspace_persist"
  | "workflow_import"
  | "score_export"

export type WorkflowImportPayload = {
  workflow: WorkflowObject
}

export type ScoreExportPayload = {
  object: ScoringObject
  evaluation: EvaluationRecord
}

export type WorkflowImportResult = {
  object: ScoringObject
  contract_response: FlowResponse
}

export type ScoreExportResult = {
  score: ScoreObject
  contract_request: FlowRequest<ScoreObject>
  contract_response: FlowResponse
}




