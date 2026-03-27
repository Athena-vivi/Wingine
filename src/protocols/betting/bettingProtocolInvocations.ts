import {
  runBettingCandidateLoadWorkflow,
  runBettingEvaluateWorkflow,
  runBettingPersistWorkflow
} from "../../workflows/betting/bettingProtocolWorkflow.ts"
import {
  runBettingBetExportProtocol,
  runBettingScoreImportProtocol
} from "./bettingProtocolHandlers.ts"
import {
  BETTING_HISTORY_STORAGE_KEY,
  createBettingProtocolRequest
} from "./bettingProtocolRequest.ts"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolResponse,
  ScoreImportPayload
} from "../../modules/capability/decision/betting_module/types/protocol.ts"
import type { BettingWorkspaceState } from "../../contracts/index.ts"

export function invokeBettingCandidateLoad(
  payload: CandidateLoadPayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingCandidateLoadWorkflow({
    payload,
    createRequest: createBettingProtocolRequest,
    storageKey: BETTING_HISTORY_STORAGE_KEY
  })
}

export function invokeBettingEvaluate(
  payload: BetEvaluatePayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingEvaluateWorkflow({
    payload,
    createRequest: createBettingProtocolRequest
  })
}

export function invokeBettingPersist(
  payload: BetPersistPayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingPersistWorkflow({
    payload,
    storageKey: BETTING_HISTORY_STORAGE_KEY,
    createRequest: createBettingProtocolRequest
  })
}

export function invokeBettingScoreImport(
  payload: ScoreImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runBettingScoreImportProtocol(payload)
}

export function invokeBettingBetExport(
  payload: BetExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runBettingBetExportProtocol(payload)
}
