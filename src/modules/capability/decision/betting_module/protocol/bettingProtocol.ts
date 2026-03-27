import {
  dispatchBettingBetExport,
  dispatchBettingCandidateLoad,
  dispatchBettingEvaluate,
  dispatchBettingPersist,
  dispatchBettingScoreImport
} from "../../../../../protocols/betting/bettingProtocolDispatch.ts"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolResponse
} from "../types/protocol.ts"
import type { ScoreImportPayload } from "../types/protocol.ts"
import type { BettingCandidate, BettingInput, BettingRecord } from "../types/betting.ts"

export type BettingWorkspaceState = {
  selectedCandidateId: string
  candidates: BettingCandidate[]
  currentCandidate: BettingCandidate
  currentInput: BettingInput
  inputSource: string
  currentRecord: BettingRecord | null
  history: BettingRecord[]
}

export function protocolCandidateLoad(
  payload: CandidateLoadPayload
): ProtocolResponse<BettingWorkspaceState> {
  return dispatchBettingCandidateLoad(payload)
}

export function protocolBetEvaluate(
  payload: BetEvaluatePayload
): ProtocolResponse<BettingWorkspaceState> {
  return dispatchBettingEvaluate(payload)
}

export function protocolBetPersist(
  payload: BetPersistPayload
): ProtocolResponse<BettingWorkspaceState> {
  return dispatchBettingPersist(payload)
}

export function protocolScoreImport(
  payload: ScoreImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return dispatchBettingScoreImport(payload)
}

export function protocolBetExport(
  payload: BetExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return dispatchBettingBetExport(payload)
}




