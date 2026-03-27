import {
  runBettingCandidateLoadWorkflow,
  runBettingEvaluateWorkflow,
  runBettingPersistWorkflow
} from "../../workflows/betting/bettingProtocolWorkflow.ts"
import {
  runBettingBetExportProtocol,
  runBettingScoreImportProtocol
} from "./bettingProtocolHandlers.ts"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolCaller,
  ProtocolRequest,
  ProtocolResponse
} from "../../modules/capability/decision/betting_module/types/protocol.ts"
import type { ScoreImportPayload } from "../../modules/capability/decision/betting_module/types/protocol.ts"
import type { BettingWorkspaceState } from "../../modules/capability/decision/betting_module/protocol/bettingProtocol.ts"

const HISTORY_STORAGE_KEY = "betting-history-v1"

const defaultCaller: ProtocolCaller = {
  type: "human-ui",
  id: "betting-interface"
}

function createRequest<TPayload>(
  capability: string,
  payload: TPayload,
  context: ProtocolRequest<TPayload>["context"]
): ProtocolRequest<TPayload> {
  return {
    request_id: `${capability}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    capability,
    caller: defaultCaller,
    payload,
    context
  }
}

export function dispatchBettingCandidateLoad(
  payload: CandidateLoadPayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingCandidateLoadWorkflow({
    payload,
    createRequest,
    storageKey: HISTORY_STORAGE_KEY
  })
}

export function dispatchBettingEvaluate(
  payload: BetEvaluatePayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingEvaluateWorkflow({
    payload,
    createRequest
  })
}

export function dispatchBettingPersist(
  payload: BetPersistPayload
): ProtocolResponse<BettingWorkspaceState> {
  return runBettingPersistWorkflow({
    payload,
    storageKey: HISTORY_STORAGE_KEY,
    createRequest
  })
}

export function dispatchBettingScoreImport(
  payload: ScoreImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runBettingScoreImportProtocol(payload)
}

export function dispatchBettingBetExport(
  payload: BetExportPayload
): ProtocolResponse<Record<string, unknown>> {
  return runBettingBetExportProtocol(payload)
}
