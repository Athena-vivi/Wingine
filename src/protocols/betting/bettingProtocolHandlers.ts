import { exportBetObjectFromBettingRecord } from "../../modules/capability/decision/betting_module/adapters/betExportAdapter.ts"
import { importScoreObjectToBettingSignal } from "../../modules/capability/decision/betting_module/adapters/scoreImportAdapter.ts"
import { buildBettingFeedbackRequest, evaluateScoreToBettingGate } from "../../modules/capability/decision/betting_module/contracts/bettingFeedback.ts"
import type {
  BetExportPayload,
  ProtocolResponse,
  ScoreImportPayload
} from "../../modules/capability/decision/betting_module/types/protocol.ts"

export function runBettingScoreImportProtocol(
  payload: ScoreImportPayload
): ProtocolResponse<Record<string, unknown>> {
  const imported = importScoreObjectToBettingSignal(payload.score)

  return {
    request_id: `score-import-${payload.score.id}`,
    capability: "score_import",
    status: "success",
    state: "ready",
    data: {
      candidate: imported.candidate,
      input: imported.input,
      contract_response: evaluateScoreToBettingGate(payload.score.object_id, payload.score.id)
    },
    error: null
  }
}

export function runBettingBetExportProtocol(
  payload: BetExportPayload
): ProtocolResponse<Record<string, unknown>> {
  const consumer = payload.consumer ?? (payload.record.objectType === "problem" ? "radar" : "builder")
  const bet = exportBetObjectFromBettingRecord(payload.record)

  return {
    request_id: `bet-export-${payload.record.id}`,
    capability: "bet_export",
    status: "success",
    state: "ready",
    data: {
      bet,
      contract_request: buildBettingFeedbackRequest({
        record: payload.record,
        consumer
      })
    },
    error: null
  }
}
