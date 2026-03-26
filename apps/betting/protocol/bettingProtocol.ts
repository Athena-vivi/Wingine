import { invokeAllocationResolver } from "@/capabilities/allocationResolver"
import { invokeBettingHistoryManager } from "@/capabilities/bettingHistoryManager"
import { invokeBettingInputResolver } from "@/capabilities/bettingInputResolver"
import { invokeCandidatePoolLoader } from "@/capabilities/candidatePoolLoader"
import { invokeDecisionRecordManager } from "@/capabilities/decisionRecordManager"
import { invokeDecisionResolver } from "@/capabilities/decisionResolver"
import { invokeFactorNormalizer } from "@/capabilities/factorNormalizer"
import { invokeScoringSignalAdapter } from "@/capabilities/scoringSignalAdapter"
import { exportBetObjectFromBettingRecord } from "@/adapters/betExportAdapter"
import { importScoreObjectToBettingSignal } from "@/adapters/scoreImportAdapter"
import { buildBettingFeedbackRequest, evaluateScoreToBettingGate } from "@/contracts/bettingFeedback"
import { bettingCandidates } from "@/data/bettingCandidates"
import type {
  BetEvaluatePayload,
  BetExportPayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolCaller,
  ProtocolRequest,
  ProtocolResponse
} from "@/types/protocol"
import type { ScoreImportPayload } from "@/types/protocol"
import type { BettingCandidate, BettingInput, BettingRecord } from "@/types/betting"

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
  const currentCandidate = bettingCandidates.find((item) => item.id === payload.candidateId) ?? bettingCandidates[0]
  const persistedHistory = typeof window === "undefined" ? [] : loadPersistedHistory()

  const candidateResponse = invokeCandidatePoolLoader(
    createRequest(
      "candidate_pool_loader",
      {
        object_id: currentCandidate.id,
        object_type: currentCandidate.objectType
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  const historyResponse = invokeBettingHistoryManager(
    createRequest(
      "betting_history_manager",
      {
        object_id: currentCandidate.id
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  const seedResponse = invokeScoringSignalAdapter(
    createRequest(
      "scoring_signal_adapter",
      {
        object_id: currentCandidate.id,
        object_type: currentCandidate.objectType
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  if (candidateResponse.status === "error" || historyResponse.status === "error" || seedResponse.status === "error") {
    return {
      request_id: `candidate-load-${payload.candidateId}`,
      capability: "candidate_load",
      status: "error",
      state: "error",
      data: null,
      error: candidateResponse.error ?? historyResponse.error ?? seedResponse.error
    }
  }

  return {
    request_id: `candidate-load-${payload.candidateId}`,
    capability: "candidate_load",
    status: "success",
    state: "ready",
    data: {
      selectedCandidateId: currentCandidate.id,
      candidates: bettingCandidates,
      currentCandidate: candidateResponse.data!.candidate,
      currentInput: seedResponse.data!.betting_input,
      inputSource: seedResponse.data!.source,
      currentRecord: null,
      history: [...persistedHistory.filter((item) => item.objectId === currentCandidate.id), ...historyResponse.data!.history]
    },
    error: null
  }
}

export function protocolBetEvaluate(
  payload: BetEvaluatePayload
): ProtocolResponse<BettingWorkspaceState> {
  const currentCandidate = bettingCandidates.find((item) => item.id === payload.candidateId) ?? bettingCandidates[0]

  const inputResponse = invokeBettingInputResolver(
    createRequest("betting_input_resolver", payload.input, {
      objectId: currentCandidate.id,
      objectType: currentCandidate.objectType
    })
  )

  if (inputResponse.status === "error") {
    return {
      request_id: inputResponse.request_id,
      capability: "bet_evaluate",
      status: "error",
      state: "error",
      data: null,
      error: inputResponse.error
    }
  }

  const normalizedResponse = invokeFactorNormalizer(
    createRequest("factor_normalizer", inputResponse.data!.betting_input, {
      objectId: currentCandidate.id,
      objectType: currentCandidate.objectType
    })
  )

  const decisionResponse = invokeDecisionResolver(
    createRequest("decision_resolver", inputResponse.data!.betting_input, {
      objectId: currentCandidate.id,
      objectType: currentCandidate.objectType
    })
  )

  if (normalizedResponse.status === "error" || decisionResponse.status === "error") {
    return {
      request_id: `bet-evaluate-${payload.candidateId}`,
      capability: "bet_evaluate",
      status: "error",
      state: "error",
      data: null,
      error: normalizedResponse.error ?? decisionResponse.error
    }
  }

  const allocationResponse = invokeAllocationResolver(
    createRequest(
      "allocation_resolver",
      {
        decision: decisionResponse.data!.decision
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  if (allocationResponse.status === "error") {
    return {
      request_id: allocationResponse.request_id,
      capability: "bet_evaluate",
      status: "error",
      state: "error",
      data: null,
      error: allocationResponse.error
    }
  }

  const recordResponse = invokeDecisionRecordManager(
    createRequest(
      "decision_record_manager",
      {
        candidate: currentCandidate,
        input: inputResponse.data!.betting_input,
        normalized_factors: normalizedResponse.data!.normalized_factors,
        decision: decisionResponse.data!.decision,
        resource_allocation: allocationResponse.data!.resource_allocation,
        reason: decisionResponse.data!.reason
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  if (recordResponse.status === "error") {
    return {
      request_id: recordResponse.request_id,
      capability: "bet_evaluate",
      status: "error",
      state: "error",
      data: null,
      error: recordResponse.error
    }
  }

  const historyResponse = invokeBettingHistoryManager(
    createRequest(
      "betting_history_manager",
      {
        object_id: currentCandidate.id
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  return {
    request_id: `bet-evaluate-${payload.candidateId}`,
    capability: "bet_evaluate",
    status: "success",
    state: "ready",
    data: {
      selectedCandidateId: currentCandidate.id,
      candidates: bettingCandidates,
      currentCandidate,
      currentInput: inputResponse.data!.betting_input,
      inputSource: "manual-or-ui",
      currentRecord: recordResponse.data!.record,
      history: historyResponse.status === "success" ? historyResponse.data!.history : []
    },
    error: null
  }
}

function loadPersistedHistory(): BettingRecord[] {
  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY)

    if (!stored) {
      return []
    }

    return JSON.parse(stored) as BettingRecord[]
  } catch {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY)
    return []
  }
}

function persistHistory(records: BettingRecord[]): void {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records))
}

export function protocolBetPersist(
  payload: BetPersistPayload
): ProtocolResponse<BettingWorkspaceState> {
  const currentCandidate = bettingCandidates.find((item) => item.id === payload.candidateId) ?? bettingCandidates[0]
  const currentHistory = loadPersistedHistory()
  const nextHistory = [payload.record, ...currentHistory.filter((item) => item.timestamp !== payload.record.timestamp)]

  try {
    persistHistory(nextHistory)
  } catch {
    return {
      request_id: `bet-persist-${payload.candidateId}`,
      capability: "bet_persist",
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "persist_failure",
        message: "failed to persist betting history"
      }
    }
  }

  const candidateResponse = invokeCandidatePoolLoader(
    createRequest(
      "candidate_pool_loader",
      {
        object_id: currentCandidate.id,
        object_type: currentCandidate.objectType
      },
      {
        objectId: currentCandidate.id,
        objectType: currentCandidate.objectType
      }
    )
  )

  if (candidateResponse.status === "error") {
    return {
      request_id: `bet-persist-${payload.candidateId}`,
      capability: "bet_persist",
      status: "error",
      state: "error",
      data: null,
      error: candidateResponse.error
    }
  }

  return {
    request_id: `bet-persist-${payload.candidateId}`,
    capability: "bet_persist",
    status: "success",
    state: "ready",
    data: {
      selectedCandidateId: currentCandidate.id,
      candidates: bettingCandidates,
      currentCandidate: candidateResponse.data!.candidate,
      currentInput: payload.record.input,
      inputSource: "persisted-record",
      currentRecord: payload.record,
      history: nextHistory.filter((item) => item.objectId === currentCandidate.id)
    },
    error: null
  }
}

export function protocolScoreImport(
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

export function protocolBetExport(
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
