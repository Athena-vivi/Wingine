import type { ScoreObject, ScoreStatus } from "../../../shared/index.ts"
import type { EvaluationRecord, ScoringObject } from "../types/scoring.ts"

function resolveScoreStatus(evaluation: EvaluationRecord): ScoreStatus {
  if (evaluation.aggregate.gateResult) {
    return "scored"
  }

  return "draft"
}

export function exportScoreObjectFromEvaluation({
  evaluation,
  object
}: {
  evaluation: EvaluationRecord
  object: ScoringObject
}): ScoreObject {
  const status = resolveScoreStatus(evaluation)

  return {
    id: `score_${evaluation.id}`,
    type: "score",
    source: {
      system: "scoring",
      origin_id: evaluation.id,
      origin_ref: evaluation.objectId
    },
    status,
    metadata: {
      tags: [object.type, evaluation.aggregate.gateResult].filter(Boolean),
      labels: [object.source ?? "scoring"],
      custom: {
        object_type: evaluation.objectType,
        profile_id: evaluation.profileId,
        gate_result: evaluation.aggregate.gateResult
      }
    },
    timestamps: {
      created_at: evaluation.execution.timestamp,
      updated_at: new Date().toISOString(),
      observed_at: new Date().toISOString()
    },
    object_id: evaluation.objectId,
    dimensions: {
      value: evaluation.dimensions.value.score,
      quality: evaluation.dimensions.quality.score,
      reliability: evaluation.dimensions.reliability.score,
      leverage: evaluation.dimensions.leverage.score
    },
    weighted_score: evaluation.aggregate.weightedScore,
    confidence: evaluation.aggregate.confidence
  }
}




