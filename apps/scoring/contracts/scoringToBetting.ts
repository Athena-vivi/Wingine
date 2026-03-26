import type { FlowRequest, FlowResponse, ScoreObject } from "../../../packages/shared"
import { exportScoreObjectFromEvaluation } from "@/adapters/scoreExportAdapter"
import type { EvaluationRecord, ScoringObject } from "@/types/scoring"

export function buildScoringToBettingRequest({
  evaluation,
  object
}: {
  evaluation: EvaluationRecord
  object: ScoringObject
}): FlowRequest<ScoreObject> {
  const score = exportScoreObjectFromEvaluation({ evaluation, object })

  return {
    contract_name: "scoring_to_betting",
    producer: "scoring",
    consumer: "betting",
    object: score,
    context: {
      request_id: `scoring-to-betting-${score.id}`,
      trigger: "score_ready_for_betting",
      sent_at: new Date().toISOString()
    }
  }
}

export function evaluateScoringToBettingGate(score: ScoreObject): FlowResponse {
  const accepted = Boolean(score.object_id && Number.isFinite(score.weighted_score) && Number.isFinite(score.confidence))

  return {
    contract_name: "scoring_to_betting",
    accepted,
    gate_result: accepted ? "pass" : "reject",
    state_change: accepted
      ? {
          from: score.status,
          to: score.status
        }
      : null,
    references: {
      input_id: score.id,
      output_id: accepted ? `bet_${score.object_id}` : null,
      output_type: accepted ? "bet" : null
    },
    message: accepted ? "score accepted for betting" : "score rejected by betting intake gate"
  }
}
