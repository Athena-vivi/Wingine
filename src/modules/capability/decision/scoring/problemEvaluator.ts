import type { ProblemObject, ScoreObject } from "../../shared/index.ts"
import {
  averageWeightedScore,
  resolveProblemScoreBreakdown,
  resolveProblemScoreConfidence
} from "../../../../control/policy/problemScoringPolicy.ts"

export type ProblemEvaluatorInput = {
  problem: ProblemObject
}

export function evaluateProblem(input: ProblemEvaluatorInput): ScoreObject {
  const { problem } = input
  const classifiedType =
    typeof problem.metadata.custom.type === "string" ? problem.metadata.custom.type : "general"
  const breakdown = resolveProblemScoreBreakdown(problem)
  const weightedScore = Number(averageWeightedScore(breakdown).toFixed(3))
  const confidence = resolveProblemScoreConfidence(breakdown)
  const timestamp = new Date().toISOString()

  return {
    id: `score_${problem.id}`,
    type: "score",
    source: {
      system: "scoring",
      origin_id: "runtime_problem_evaluator",
      origin_ref: "core/scoring/problemEvaluator.evaluateProblem"
    },
    status: "scored",
    metadata: {
      tags: ["problem_score", "minimal_score"],
      labels: ["gating"],
      custom: {
        problem_id: problem.id,
        record_worthy: problem.record_worthy ?? false,
        type: classifiedType,
        score_breakdown: breakdown
      }
    },
    timestamps: {
      created_at: timestamp,
      updated_at: timestamp,
      observed_at: timestamp
    },
    object_id: problem.id,
    dimensions: {
      value: weightedScore,
      quality: weightedScore,
      reliability: confidence,
      leverage: weightedScore
    },
    weighted_score: weightedScore,
    confidence
  }
}

