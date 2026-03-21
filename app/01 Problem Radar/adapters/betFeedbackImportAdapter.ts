import type { BetObject } from "../../SharedContracts"

export type RadarBetFeedbackIntake = {
  bet_id: string
  problem_id: string
  decision: string
  recommended_action: "monitor" | "archive" | "promote"
  suggested_state: "qualified" | "linked" | "archived"
}

function resolveSuggestedState(bet: BetObject): RadarBetFeedbackIntake["suggested_state"] {
  const decision = String(bet.metadata.custom.decision)

  if (decision === "kill") {
    return "archived"
  }

  if (decision === "scale") {
    return "linked"
  }

  return "qualified"
}

function resolveAction(bet: BetObject): RadarBetFeedbackIntake["recommended_action"] {
  const decision = String(bet.metadata.custom.decision)

  if (decision === "kill") {
    return "archive"
  }

  if (decision === "scale") {
    return "promote"
  }

  return "monitor"
}

export function importBetFeedbackToRadar(bet: BetObject): RadarBetFeedbackIntake {
  return {
    bet_id: bet.id,
    problem_id: bet.object_id,
    decision: String(bet.metadata.custom.decision),
    recommended_action: resolveAction(bet),
    suggested_state: resolveSuggestedState(bet)
  }
}
