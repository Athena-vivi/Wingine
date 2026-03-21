import type { BetObject, FlowResponse, ProblemObject, ScoreObject, WorkflowObject } from "../../SharedContracts"
import type { BuilderWorkspaceRecord, CapabilitySet, Output, Problem, UITemplate, Workflow } from "@/types/builder"

export type BuilderCapabilityName =
  | "builder_record_manager"
  | "workflow_manager"
  | "workflow_step_linker"
  | "capability_attachment_manager"
  | "capability_detail_resolver"
  | "output_manager"
  | "ui_template_manager"

export type BuilderProtocolName =
  | "builder_load"
  | "workflow_update"
  | "workflow_link_update"
  | "capability_attachment_update"
  | "output_update"
  | "builder_persist"
  | "problem_import"
  | "workflow_export"
  | "scoring_to_builder_feedback"
  | "betting_to_builder_feedback"

export type ProtocolCallerType = "human-ui" | "agent" | "api"

export type BuilderProtocolContext = {
  problem_id?: string
  step_id?: string
  capability_id?: string
}

export type BuilderProtocolRequest<T = Record<string, unknown>> = {
  request_id: string
  capability: BuilderCapabilityName | BuilderProtocolName
  caller: {
    type: ProtocolCallerType
    id: string
  }
  payload: T
  context: BuilderProtocolContext
}

export type BuilderProtocolResponse<T = Record<string, unknown>> = {
  request_id: string
  capability: BuilderCapabilityName | BuilderProtocolName
  status: "success" | "error"
  state: "idle" | "loading" | "validating" | "updating" | "persisting" | "ready" | "error"
  data: T | null
  error: {
    code: string
    message: string
  } | null
}

export type BuilderWorkspacePayload = {
  problem_id: string
  problems: BuilderWorkspaceRecord["problem"][]
  workflows: Workflow[]
  capability_sets: CapabilitySet[]
  outputs: Output[]
  templates: UITemplate[]
}

export type ProblemImportPayload = {
  problem: ProblemObject
}

export type WorkflowExportPayload = {
  workflow: Workflow
  problem: Problem
}

export type ProblemImportResult = {
  problem: Problem
  contract_response: FlowResponse
}

export type WorkflowExportResult = {
  workflow: WorkflowObject
  contract_response: FlowResponse
}

export type ScoringFeedbackImportPayload = {
  score: ScoreObject
}

export type BettingFeedbackImportPayload = {
  bet: BetObject
}
