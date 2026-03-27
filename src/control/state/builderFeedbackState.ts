import type { ModuleStatus, OutputStatus, WorkflowStatus } from "../../contracts/index.ts"
import type { BuilderBetFeedbackIntake } from "../../modules/system/builder/builder/adapters/betFeedbackImportAdapter.ts"
import type { BuilderFeedbackIntake } from "../../modules/system/builder/builder/adapters/scoreFeedbackImportAdapter.ts"

export type BuilderFeedbackEntry = {
  source: "scoring" | "betting"
  object_id: string
  suggested_state: string
  recommended_action: string
  received_at: string
  reference_id: string
}

export type BuilderRuntimeStatePatch = {
  workflow_statuses?: Record<string, WorkflowStatus>
  module_statuses?: Record<string, ModuleStatus>
  output_statuses?: Record<string, OutputStatus>
  feedback_entry: BuilderFeedbackEntry
}

function isWorkflowState(value: string): value is WorkflowStatus {
  return ["draft", "mapped", "executable", "blocked", "retired"].includes(value)
}

function isModuleState(value: string): value is ModuleStatus {
  return ["draft", "attached", "active", "idle", "retired"].includes(value)
}

function isOutputState(value: string): value is OutputStatus {
  return ["draft", "in-progress", "testing", "done", "archived"].includes(value)
}

export function buildScoringFeedbackStatePatch(feedback: BuilderFeedbackIntake): BuilderRuntimeStatePatch {
  return {
    workflow_statuses:
      feedback.object_type === "workflow" && isWorkflowState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    module_statuses:
      feedback.object_type === "module" && isModuleState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    output_statuses:
      feedback.object_type === "output" && isOutputState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    feedback_entry: {
      source: "scoring",
      object_id: feedback.object_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.score_id
    }
  }
}

export function buildBettingFeedbackStatePatch(feedback: BuilderBetFeedbackIntake): BuilderRuntimeStatePatch {
  const objectType = feedback.object_id.split("_")[0]

  return {
    workflow_statuses:
      objectType === "workflow" && isWorkflowState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    module_statuses:
      objectType === "module" && isModuleState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    output_statuses:
      objectType === "output" && isOutputState(feedback.suggested_state)
        ? { [feedback.object_id]: feedback.suggested_state }
        : undefined,
    feedback_entry: {
      source: "betting",
      object_id: feedback.object_id,
      suggested_state: feedback.suggested_state,
      recommended_action: feedback.recommended_action,
      received_at: new Date().toISOString(),
      reference_id: feedback.bet_id
    }
  }
}
