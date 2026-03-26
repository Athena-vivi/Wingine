import type { BetObject, ScoreObject } from "../shared/index.ts"

export type ProblemDecisionInput = {
  score: ScoreObject
}

export function resolveProblemDecision(input: ProblemDecisionInput): BetObject {
  const { score } = input
  const decision = score.weighted_score > 0.5 ? "invest" : "skip"
  const timestamp = new Date().toISOString()

  return {
    id: `bet_${score.id}`,
    type: "bet",
    source: {
      system: "betting",
      origin_id: "runtime_problem_decision_resolver",
      origin_ref: "packages/runtime/problemDecisionResolver.resolveProblemDecision"
    },
    status: decision === "invest" ? "active" : "held",
    metadata: {
      tags: ["problem_gate"],
      labels: ["gating"],
      custom: {
        decision,
        score_ref: score.object_id
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
      time: decision === "invest" ? "now" : "defer",
      priority: decision === "invest" ? "high" : "low",
      action: decision
    },
    reason:
      decision === "invest"
        ? "problem score passed the minimum builder gate"
        : "problem score did not pass the minimum builder gate"
  }
}
