import type { ExecutionResult } from "./executionProtocol.ts"
import type { FeedbackRecord } from "./decisionFeedbackRecorder.ts"

export type OutcomeAdapterInput = {
  execution_result: ExecutionResult
  object_id: string
  type: string
}

export function adaptOutcomeFeedback(input: OutcomeAdapterInput): FeedbackRecord {
  return {
    source: "outcome",
    object_id: input.object_id,
    type: input.type,
    outcome_success: input.execution_result.status === "success",
    outcome_signal: input.execution_result.status === "success" ? 1 : 0,
    timestamp: new Date().toISOString()
  }
}
