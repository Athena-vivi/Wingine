import {
  protocolBetEvaluate,
  protocolBetExport,
  protocolBetPersist,
  protocolCandidateLoad,
  protocolScoreImport
} from "./bettingProtocol.ts"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  BettingCompositeProtocol,
  CandidateLoadPayload,
  ProtocolResponse
} from "../types/protocol.ts"
import type { ScoreImportPayload } from "../types/protocol.ts"
import type { BettingWorkspaceState } from "./bettingProtocol.ts"

type CompositeResponse = ProtocolResponse<BettingWorkspaceState | Record<string, unknown>>

export function invokeWorkspaceProtocol(
  protocol: BettingCompositeProtocol,
  payload: CandidateLoadPayload | BetEvaluatePayload | BetPersistPayload | ScoreImportPayload | BetExportPayload
): CompositeResponse {
  switch (protocol) {
    case "candidate_load":
    case "bet_history_load":
      return protocolCandidateLoad(payload as CandidateLoadPayload)
    case "bet_evaluate":
      return protocolBetEvaluate(payload as BetEvaluatePayload)
    case "bet_persist":
      return protocolBetPersist(payload as BetPersistPayload)
    case "score_import":
      return protocolScoreImport(payload as ScoreImportPayload)
    case "bet_export":
      return protocolBetExport(payload as BetExportPayload)
    default:
      return {
        request_id: `betting-${Date.now()}`,
        capability: protocol,
        status: "error",
        state: "error",
        data: null,
        error: {
          code: "protocol_not_found",
          message: "betting protocol is not registered"
        }
      }
  }
}


