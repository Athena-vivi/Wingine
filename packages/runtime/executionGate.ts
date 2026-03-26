import { generateContentDraft, type ContentDraft } from "./contentDraftGenerator.ts"
import type { BetObject, ProblemObject } from "../shared/index.ts"

export type ExecutionGateInput = {
  problem: ProblemObject
  bet: BetObject
}

export type ExecutionResultRecord = {
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

function resolveDecision(bet: BetObject) {
  return String(bet.metadata.custom.decision ?? bet.resource_allocation.action ?? "skip")
}

export function applyExecutionGate(input: ExecutionGateInput): ExecutionResultRecord {
  const decision = resolveDecision(input.bet)
  const type = String(input.problem.metadata.custom.type ?? "general")

  if (decision === "invest") {
    return {
      object_id: input.problem.id,
      type,
      decision,
      executed: true,
      status: "ready_to_publish",
      draft: generateContentDraft({
        problem: input.problem
      }),
      published: false
    }
  }

  if (decision === "hold") {
    return {
      object_id: input.problem.id,
      type,
      decision,
      executed: false,
      status: "stored",
      draft: null,
      published: false
    }
  }

  return {
    object_id: input.problem.id,
    type,
    decision,
    executed: false,
    status: "discarded",
    draft: null,
    published: false
  }
}
