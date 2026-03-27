import type { ScoreObject } from "../../../../capability/shared/index.ts"

export type BuilderFeedbackIntake = {
  score_id: string
  object_id: string
  object_type: "workflow" | "module" | "output"
  gate_result: string
  recommended_action: "revise" | "hold" | "archive"
  suggested_state: string
}

function resolveSuggestedState(score: ScoreObject): string {
  const objectType = String(score.metadata.custom.object_type)
  const gateResult = String(score.metadata.custom.gate_result)

  if (objectType === "workflow") {
    return gateResult === "improve" ? "draft" : "blocked"
  }

  if (objectType === "module") {
    return gateResult === "improve" ? "draft" : "idle"
  }

  return "in-progress"
}

function resolveAction(score: ScoreObject): BuilderFeedbackIntake["recommended_action"] {
  const gateResult = String(score.metadata.custom.gate_result)

  if (gateResult === "reject") {
    return "archive"
  }

  if (gateResult === "hold") {
    return "hold"
  }

  return "revise"
}

export function importScoreFeedbackToBuilder(score: ScoreObject): BuilderFeedbackIntake {
  return {
    score_id: score.id,
    object_id: score.object_id,
    object_type: String(score.metadata.custom.object_type) as BuilderFeedbackIntake["object_type"],
    gate_result: String(score.metadata.custom.gate_result),
    recommended_action: resolveAction(score),
    suggested_state: resolveSuggestedState(score)
  }
}



