import type { BetObject, ProblemObject } from "../../modules/capability/shared/index.ts"

export function resolveExecutionDecision(bet: BetObject) {
  return String(bet.metadata.custom.decision ?? bet.resource_allocation.action ?? "skip")
}

export function resolveExecutionGateState(input: {
  problem: ProblemObject
  decision: string
}) {
  const type = String(input.problem.metadata.custom.type ?? "general")

  if (input.decision === "invest") {
    return {
      type,
      decision: input.decision,
      executed: true,
      status: "ready_to_publish" as const
    }
  }

  if (input.decision === "hold") {
    return {
      type,
      decision: input.decision,
      executed: false,
      status: "stored" as const
    }
  }

  return {
    type,
    decision: input.decision,
    executed: false,
    status: "discarded" as const
  }
}
