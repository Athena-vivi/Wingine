import type { BetObject, ScoreObject } from "../../shared/index.ts"
import { mapProblemDecisionAllocation, mapProblemDecisionReason } from "../../../../control/mapping/problemDecisionMapping.ts"
import { resolveProblemDecisionPolicy } from "../../../../control/policy/problemDecisionPolicy.ts"

export type ProblemDecisionInput = {
  score: ScoreObject
}

export function resolveProblemDecision(input: ProblemDecisionInput): BetObject {
  const { score } = input
  const decision = resolveProblemDecisionPolicy(score.weighted_score)
  const timestamp = new Date().toISOString()

  return {
    id: `bet_${score.id}`,
    type: "bet",
    source: {
      system: "betting",
      origin_id: "runtime_problem_decision_resolver",
      origin_ref: "core/betting/problemDecisionResolver.resolveProblemDecision"
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
    resource_allocation: mapProblemDecisionAllocation(decision),
    reason: mapProblemDecisionReason(decision)
  }
}

