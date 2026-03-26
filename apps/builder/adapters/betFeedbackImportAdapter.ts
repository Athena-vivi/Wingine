import type { BetObject } from "../../../packages/shared"

export type BuilderBetFeedbackIntake = {
  bet_id: string
  object_id: string
  decision: string
  recommended_action: "accelerate" | "hold" | "stop" | "expand"
  suggested_state: string
}

function resolveAction(bet: BetObject): BuilderBetFeedbackIntake["recommended_action"] {
  const decision = String(bet.metadata.custom.decision)

  if (decision === "kill") {
    return "stop"
  }

  if (decision === "hold") {
    return "hold"
  }

  if (decision === "scale") {
    return "expand"
  }

  return "accelerate"
}

function resolveSuggestedState(bet: BetObject): string {
  const decision = String(bet.metadata.custom.decision)
  const objectType = String(bet.metadata.custom.object_type)

  if (decision === "kill") {
    return objectType === "module" ? "retired" : "blocked"
  }

  if (decision === "hold") {
    return objectType === "module" ? "idle" : "blocked"
  }

  if (decision === "scale") {
    return objectType === "output" ? "done" : "executable"
  }

  return objectType === "output" ? "in-progress" : "executable"
}

export function importBetFeedbackToBuilder(bet: BetObject): BuilderBetFeedbackIntake {
  return {
    bet_id: bet.id,
    object_id: bet.object_id,
    decision: String(bet.metadata.custom.decision),
    recommended_action: resolveAction(bet),
    suggested_state: resolveSuggestedState(bet)
  }
}
