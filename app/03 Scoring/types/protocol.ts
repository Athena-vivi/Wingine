import type { FlowRequest, FlowResponse, ScoreObject, WorkflowObject } from "../../SharedContracts"
import type {
  EvaluationRecord,
  EvaluatorRole,
  RoleInputStatus,
  ScoringDimension,
  ScoringObject,
  ScoringObjectType,
  TypeProfile
} from "@/types/scoring"

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

export type CapabilityCallerType = "human-ui" | "agent" | "api"

export type ProtocolCaller = {
  type: CapabilityCallerType
  id: string
}

export type ProtocolContext = {
  objectId?: string
  objectType?: ScoringObjectType
  evaluationId?: string
}

export type CapabilityDefinition = {
  name: string
  purpose: string
  input_schema: Record<string, string | Record<string, string>>
  process_logic: string[]
  output_schema: Record<string, string | Record<string, string>>
  state: string
  trigger: string
  error_handling: Record<string, string>
}

export type ProtocolRequest<TPayload = Record<string, unknown>> = {
  request_id: string
  capability: string
  caller: ProtocolCaller
  payload: TPayload
  context: ProtocolContext
}

export type ProtocolResponse<TData = Record<string, unknown>> = {
  request_id: string
  capability: string
  status: "success" | "error"
  state: CapabilityState
  data: TData | null
  error: {
    code: string
    message: string
  } | null
}

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
