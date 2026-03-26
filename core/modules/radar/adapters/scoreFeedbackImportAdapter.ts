import type { ScoreObject } from "../../shared/index.ts"

export type RadarFeedbackIntake = {
  score_id: string
  problem_id: string
  gate_result: string
  suggested_state: "qualified" | "structured" | "linked" | "archived"
  recommended_action: "monitor" | "revise" | "archive" | "promote"
}

function resolveSuggestedState(score: ScoreObject): RadarFeedbackIntake["suggested_state"] {
  const gateResult = String(score.metadata.custom.gate_result)

  if (gateResult === "reject") {
    return "archived"
  }

  if (gateResult === "hold") {
    return "qualified"
  }

  if (gateResult === "improve") {
    return "structured"
  }

  return "linked"
}

function resolveAction(score: ScoreObject): RadarFeedbackIntake["recommended_action"] {
  const gateResult = String(score.metadata.custom.gate_result)

  if (gateResult === "reject") {
    return "archive"
  }

  if (gateResult === "hold") {
    return "monitor"
  }

  if (gateResult === "improve") {
    return "revise"
  }

  return "promote"
}

export function importScoreFeedbackToRadar(score: ScoreObject): RadarFeedbackIntake {
  return {
    score_id: score.id,
    problem_id: score.object_id,
    gate_result: String(score.metadata.custom.gate_result),
    suggested_state: resolveSuggestedState(score),
    recommended_action: resolveAction(score)
  }
}

