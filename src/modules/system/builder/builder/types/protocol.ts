import type {
  BetObject,
  FlowResponse,
  ProblemObject,
  ProtocolRequest as BaseProtocolRequest,
  ProtocolResponse as BaseProtocolResponse,
  ScoreObject,
  WorkflowObject
} from "../../../../../contracts/index.ts"
import type { BuilderWorkspaceRecord, CapabilitySet, Output, Problem, UITemplate, Workflow } from "./builder.ts"

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

export type BuilderProtocolRequest<T = Record<string, unknown>> = BaseProtocolRequest<
  T,
  BuilderProtocolContext,
  BuilderCapabilityName | BuilderProtocolName,
  ProtocolCallerType
>

export type BuilderProtocolResponse<T = Record<string, unknown>> = BaseProtocolResponse<
  T,
  "idle" | "loading" | "validating" | "updating" | "persisting" | "ready" | "error",
  BuilderCapabilityName | BuilderProtocolName
>

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




