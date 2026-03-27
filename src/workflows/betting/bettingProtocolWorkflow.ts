import { invokeBettingHistoryManager } from "../../modules/capability/decision/betting_module/capabilities/bettingHistoryManager.ts"
import { invokeCandidatePoolLoader } from "../../modules/capability/decision/betting_module/capabilities/candidatePoolLoader.ts"
import { invokeDecisionRecordManager } from "../../modules/capability/decision/betting_module/capabilities/decisionRecordManager.ts"
import { invokeScoringSignalAdapter } from "../../modules/capability/decision/betting_module/capabilities/scoringSignalAdapter.ts"
import { bettingCandidates } from "../../modules/capability/decision/betting_module/data/bettingCandidates.ts"
import { decideBuild } from "../../modules/capability/decision/buildDecision.ts"
import type {
  BetEvaluatePayload,
  BetPersistPayload,
  CandidateLoadPayload,
  ProtocolRequest,
  ProtocolResponse
} from "../../modules/capability/decision/betting_module/types/protocol.ts"
import type {
  BettingDecision,
  BettingInput,
  BettingRecord,
  ResourceAllocation
} from "../../modules/capability/decision/betting_module/types/betting.ts"
import type { BettingWorkspaceState } from "../../contracts/index.ts"

type CreateRequest = <TPayload>(
  capability: string,
  payload: TPayload,
  context: ProtocolRequest<TPayload>["context"]
) => ProtocolRequest<TPayload>

export function loadPersistedBettingHistory(storageKey: string): BettingRecord[] {
  try {
    const stored = window.localStorage.getItem(storageKey)

    if (!stored) {
      return []
    }

    return JSON.parse(stored) as BettingRecord[]
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function persistBettingHistory(storageKey: string, records: BettingRecord[]): void {
  window.localStorage.setItem(storageKey, JSON.stringify(records))
}

export function runBettingCandidateLoadWorkflow(input: {
  payload: CandidateLoadPayload
  createRequest: CreateRequest
  storageKey: string
}): ProtocolResponse<BettingWorkspaceState> {
  const currentCandidate = bettingCandidates.find((item) => item.id === input.payload.candidateId) ?? bettingCandidates[0]
  const persistedHistory = typeof window === "undefined" ? [] : loadPersistedBettingHistory(input.storageKey)

  const candidateResponse = invokeCandidatePoolLoader(
    input.createRequest(
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
    input.createRequest(
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
    input.createRequest(
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
      request_id: `candidate-load-${input.payload.candidateId}`,
      capability: "candidate_load",
      status: "error",
      state: "error",
      data: null,
      error: candidateResponse.error ?? historyResponse.error ?? seedResponse.error
    }
  }

  return {
    request_id: `candidate-load-${input.payload.candidateId}`,
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

export function runBettingEvaluateWorkflow(input: {
  payload: BetEvaluatePayload
  createRequest: CreateRequest
}): ProtocolResponse<BettingWorkspaceState> {
  const currentCandidate = bettingCandidates.find((item) => item.id === input.payload.candidateId) ?? bettingCandidates[0]
  const buildDecision = decideBuild({
    createRequest: input.createRequest,
    requestContext: {
      objectId: currentCandidate.id,
      objectType: currentCandidate.objectType
    },
    buildResult: {
      input: input.payload.input
    }
  })

  if (buildDecision.status === "error") {
    return {
      request_id: buildDecision.request_id,
      capability: "bet_evaluate",
      status: "error",
      state: "error",
      data: null,
      error: buildDecision.error
    }
  }

  const recordResponse = invokeDecisionRecordManager(
    input.createRequest(
      "decision_record_manager",
      {
        candidate: currentCandidate,
        input: buildDecision.data.metadata?.input as BettingInput,
        normalized_factors: buildDecision.data.metadata?.normalized_factors as BettingRecord["normalizedFactors"],
        decision: buildDecision.data.metadata?.bet_decision as BettingDecision,
        resource_allocation: buildDecision.data.metadata?.allocation as ResourceAllocation,
        reason: String(buildDecision.data.strategy ?? "")
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
    input.createRequest(
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
    request_id: `bet-evaluate-${input.payload.candidateId}`,
    capability: "bet_evaluate",
    status: "success",
    state: "ready",
    data: {
      selectedCandidateId: currentCandidate.id,
      candidates: bettingCandidates,
      currentCandidate,
      currentInput: buildDecision.data.metadata?.input as BettingInput,
      inputSource: "manual-or-ui",
      currentRecord: recordResponse.data!.record,
      history: historyResponse.status === "success" ? historyResponse.data!.history : []
    },
    error: null
  }
}

export function runBettingPersistWorkflow(input: {
  payload: BetPersistPayload
  storageKey: string
  createRequest: CreateRequest
}): ProtocolResponse<BettingWorkspaceState> {
  const currentCandidate = bettingCandidates.find((item) => item.id === input.payload.candidateId) ?? bettingCandidates[0]
  const currentHistory = loadPersistedBettingHistory(input.storageKey)
  const nextHistory = [input.payload.record, ...currentHistory.filter((item) => item.timestamp !== input.payload.record.timestamp)]

  try {
    persistBettingHistory(input.storageKey, nextHistory)
  } catch {
    return {
      request_id: `bet-persist-${input.payload.candidateId}`,
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
    input.createRequest(
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
      request_id: `bet-persist-${input.payload.candidateId}`,
      capability: "bet_persist",
      status: "error",
      state: "error",
      data: null,
      error: candidateResponse.error
    }
  }

  return {
    request_id: `bet-persist-${input.payload.candidateId}`,
    capability: "bet_persist",
    status: "success",
    state: "ready",
    data: {
      selectedCandidateId: currentCandidate.id,
      candidates: bettingCandidates,
      currentCandidate: candidateResponse.data!.candidate,
      currentInput: input.payload.record.input,
      inputSource: "persisted-record",
      currentRecord: input.payload.record,
      history: nextHistory.filter((item) => item.objectId === currentCandidate.id)
    },
    error: null
  }
}
