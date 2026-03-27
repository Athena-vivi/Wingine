import type { BetObject, ScoreObject } from "../../shared/index.ts"
import { mapRuntimeDecisionAllocation, mapRuntimeDecisionReason } from "../../../../control/mapping/runtimeBettingMapping.ts"
import { resolveRuntimeDecisionContext, resolveRuntimeWeightedDecision } from "../../../../control/policy/runtimeBettingPolicy.ts"

export type DecisionInput = {
  score: ScoreObject
}

export function resolveBetDecision(input: DecisionInput): BetObject {
  const { score } = input
  const context = resolveRuntimeDecisionContext(score)
  const decision = resolveRuntimeWeightedDecision(score.weighted_score, context)
  const timestamp = new Date().toISOString()

  return {
    id: `bet_${score.id}`,
    type: "bet",
    source: {
      system: "betting",
      origin_id: "runtime_decision_resolver",
      origin_ref: "core/betting/bettingDecisionResolver.resolveBetDecision"
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
    resource_allocation: mapRuntimeDecisionAllocation(decision),
    reason: mapRuntimeDecisionReason(decision)
  }
}

