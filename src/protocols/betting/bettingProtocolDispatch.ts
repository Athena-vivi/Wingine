import {
  invokeBettingBetExport,
  invokeBettingCandidateLoad,
  invokeBettingEvaluate,
  invokeBettingPersist,
  invokeBettingScoreImport
} from "./bettingProtocolInvocations.ts"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolResponse,
  ScoreImportPayload
} from "../../modules/capability/decision/betting_module/types/protocol.ts"
import type { BettingWorkspaceState } from "../../contracts/index.ts"

export function dispatchBettingCandidateLoad(
  payload: CandidateLoadPayload
): ProtocolResponse<BettingWorkspaceState> {
  return invokeBettingCandidateLoad(payload)
}

export function dispatchBettingEvaluate(
  payload: BetEvaluatePayload
): ProtocolResponse<BettingWorkspaceState> {
  return invokeBettingEvaluate(payload)
}

export function dispatchBettingPersist(
  payload: BetPersistPayload
): ProtocolResponse<BettingWorkspaceState> {
  return invokeBettingPersist(payload)
}

export function dispatchBettingScoreImport(
  payload: ScoreImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return invokeBettingScoreImport(payload)
}

export function dispatchBettingBetExport(
  payload: BetExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return invokeBettingBetExport(payload)
}
