import type { BetObject, ScoreObject } from "../shared/index.ts"

export type DecisionInput = {
  score: ScoreObject
}

function resolveDecisionContext(score: ScoreObject) {
  const custom = score.metadata.custom ?? {}
  const customHighThreshold =
    typeof custom.high_threshold === "number" ? custom.high_threshold : undefined
  const customLowThreshold =
    typeof custom.low_threshold === "number" ? custom.low_threshold : undefined
  const type = String(custom.type ?? custom.structural_signal ?? "general")

  if (customHighThreshold !== undefined && customLowThreshold !== undefined) {
    return {
      type,
      high_threshold: customHighThreshold,
      low_threshold: customLowThreshold
    }
  }

  if (type === "ads") {
    return { type, high_threshold: 0.65, low_threshold: 0.62 }
  }

  if (type === "content") {
    return { type, high_threshold: 0.65, low_threshold: 0.62 }
  }

  if (type === "analytics") {
    return { type, high_threshold: 0.65, low_threshold: 0.62 }
  }

  return { type: "general", high_threshold: 0.65, low_threshold: 0.62 }
}

export function resolveBetDecision(input: DecisionInput): BetObject {
  const { score } = input
  const context = resolveDecisionContext(score)
  let decision: "invest" | "hold" | "skip"

  if (score.weighted_score >= context.high_threshold) {
    decision = "invest"
  } else if (score.weighted_score < context.low_threshold) {
    decision = "skip"
  } else {
    decision = "hold"
  }
  const timestamp = new Date().toISOString()

  return {
    id: `bet_${score.id}`,
    type: "bet",
    source: {
      system: "betting",
      origin_id: "runtime_decision_resolver",
      origin_ref: "packages/runtime/bettingDecisionResolver.resolveBetDecision"
    },
    status: decision === "invest" ? "active" : "held",
    metadata: {
      tags: ["minimal_bet"],
      labels: ["runtime_decision"],
      custom: {
        decision,
        score_ref: score.object_id,
        type: context.type,
        high_threshold: context.high_threshold,
        low_threshold: context.low_threshold
      }
    },
    timestamps: {
      created_at: timestamp,
      updated_at: timestamp,
      observed_at: timestamp
    },
    object_id: score.object_id,
    input: {
      score: score.weighted_score,
      confidence: score.confidence,
      trend: "flat",
      cost: 1
    },
    resource_allocation: {
      time: decision === "invest" ? "now" : decision === "hold" ? "review" : "defer",
      priority: decision === "invest" ? "high" : decision === "hold" ? "medium" : "low",
      action: decision
    },
    reason:
      decision === "invest"
        ? "weighted_score is at or above the high threshold"
        : decision === "hold"
          ? "weighted_score is between the low and high thresholds"
          : "weighted_score is below the low threshold"
  }
}
