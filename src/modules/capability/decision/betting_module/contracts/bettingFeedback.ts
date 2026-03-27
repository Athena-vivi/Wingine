import type { BetObject, FlowRequest, FlowResponse } from "../../../shared/index.ts"
import { exportBetObjectFromBettingRecord } from "../adapters/betExportAdapter.ts"
import type { BettingRecord } from "../types/betting.ts"

export function buildBettingFeedbackRequest({
  record,
  consumer
}: {
  record: BettingRecord
  consumer: "builder" | "radar"
}): FlowRequest<BetObject> {
  const bet = exportBetObjectFromBettingRecord(record)
  const contractName =
    consumer === "builder" ? "betting_to_builder_feedback" : "betting_to_radar_feedback"

  return {
    contract_name: contractName,
    producer: "betting",
    consumer,
    object: bet,
    context: {
      request_id: `${contractName}-${bet.id}`,
      trigger: "bet_feedback_ready",
      sent_at: new Date().toISOString()
    }
  }
}

export function evaluateScoreToBettingGate(objectId: string, scoreId: string): FlowResponse {
  const accepted = Boolean(objectId && scoreId)

  return {
    contract_name: "scoring_to_betting",
    accepted,
    gate_result: accepted ? "pass" : "reject",
    state_change: accepted
      ? {
          from: "scored",
          to: "draft"
        }
      : null,
    references: {
      input_id: scoreId,
      output_id: accepted ? `bet_${objectId}` : null,
      output_type: accepted ? "bet" : null
    },
    message: accepted ? "score accepted into betting" : "score rejected by betting intake gate"
  }
}




