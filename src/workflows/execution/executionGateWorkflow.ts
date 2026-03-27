import { generateContentDraft, type ContentDraft } from "../../modules/system/builder/contentDraftGenerator.ts"
import type { BetObject, ProblemObject } from "../../modules/capability/shared/index.ts"
import { resolveExecutionDecision, resolveExecutionGateState } from "../../control/mapping/executionGateMapping.ts"

export type ExecutionGateWorkflowInput = {
  problem: ProblemObject
  bet: BetObject
}

export type ExecutionGateWorkflowResult = {
  object_id: string
  type: string
  decision: string
  executed: boolean
  status: "ready_to_publish" | "stored" | "discarded"
  draft: ContentDraft | null
  published: boolean
  user_feedback?: string
  performance?: Record<string, unknown>
}

export function runExecutionGateWorkflow(input: ExecutionGateWorkflowInput): ExecutionGateWorkflowResult {
  const decision = resolveExecutionDecision(input.bet)
  const gateState = resolveExecutionGateState({
    problem: input.problem,
    decision
  })

  if (gateState.executed) {
    return {
      object_id: input.problem.id,
      type: gateState.type,
      decision: gateState.decision,
      executed: gateState.executed,
      status: gateState.status,
      draft: generateContentDraft({
        problem: input.problem
      }),
      published: false
    }
  }

  return {
    object_id: input.problem.id,
    type: gateState.type,
    decision: gateState.decision,
    executed: gateState.executed,
    status: gateState.status,
    draft: null,
    published: false
  }
}
