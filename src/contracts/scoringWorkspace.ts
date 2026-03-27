import type {
  EvaluationRecord,
  EvaluatorRole,
  RoleInputStatus,
  ScoringDimension,
  ScoringObject,
  TypeProfile
} from "../modules/capability/decision/scoring_module/types/scoring.ts"

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
