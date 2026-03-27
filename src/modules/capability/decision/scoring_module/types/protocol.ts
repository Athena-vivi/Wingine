import type { FlowRequest, FlowResponse, ScoreObject, WorkflowObject } from "../../../../../contracts/index.ts"
import type {
  CapabilityDefinition as BaseCapabilityDefinition,
  CapabilityCallerType,
  ProtocolCaller as BaseProtocolCaller,
  ProtocolRequest as BaseProtocolRequest,
  ProtocolResponse as BaseProtocolResponse
} from "../../../../../contracts/index.ts"
import type {
  EvaluationRecord,
  EvaluatorRole,
  RoleInputStatus,
  ScoringDimension,
  ScoringObject,
  ScoringObjectType,
  TypeProfile
} from "./scoring.ts"

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

export type ScoringWorkspaceState = {
  selectedObjectId: string
  objects: ScoringObject[]
  currentObject: ScoringObject
  profile: TypeProfile
  evaluation: EvaluationRecord
  history: EvaluationRecord[]
  evaluations: Record<string, EvaluationRecord>
}

export type LoadWorkspacePayload = {
  selectedObjectId: string
  evaluations?: Record<string, EvaluationRecord>
}

export type UpdateDimensionPayload = {
  selectedObjectId: string
  evaluations: Record<string, EvaluationRecord>
  dimension: ScoringDimension
  field: "score" | "confidence" | "note" | "evidence"
  value: number | string | string[]
}

export type UpdateRolePayload = {
  selectedObjectId: string
  evaluations: Record<string, EvaluationRecord>
  role: EvaluatorRole
  field: "status" | "note"
  value: RoleInputStatus | string
}

export type PersistWorkspacePayload = {
  selectedObjectId: string
  evaluations: Record<string, EvaluationRecord>
}

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




