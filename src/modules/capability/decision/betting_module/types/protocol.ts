import type { BetObject, FlowRequest, FlowResponse, ScoreObject } from "../../../../../contracts/index.ts"
import type {
  CapabilityDefinition as BaseCapabilityDefinition,
  CapabilityCallerType,
  ProtocolCaller as BaseProtocolCaller,
  ProtocolRequest as BaseProtocolRequest,
  ProtocolResponse as BaseProtocolResponse
} from "../../../../../contracts/index.ts"
import type { BettingCandidate, BettingInput, BettingObjectType, BettingRecord, ResourceAllocation, TrendValue } from "./betting.ts"

export type CapabilityState =
  | "idle"
  | "loading"
  | "validating"
  | "normalizing"
  | "evaluating"
  | "mapping"
  | "persisting"
  | "ready"
  | "error"

export type ProtocolCaller = BaseProtocolCaller<CapabilityCallerType>

export type ProtocolContext = {
  objectId?: string
  objectType?: BettingObjectType
}

export type CapabilityDefinition = BaseCapabilityDefinition<Record<string, string>, Record<string, string>>

export type ProtocolRequest<TPayload = Record<string, unknown>> = BaseProtocolRequest<
  TPayload,
  ProtocolContext
>

export type ProtocolResponse<TData = Record<string, unknown>> = BaseProtocolResponse<
  TData,
  CapabilityState
>

export type BettingWorkspaceState = {
  selectedCandidateId: string
  candidates: BettingCandidate[]
  currentCandidate: BettingCandidate
  currentInput: BettingInput
  currentRecord: BettingRecord | null
  history: BettingRecord[]
}

export type CandidateLoadPayload = {
  candidateId: string
}

export type BetEvaluatePayload = {
  candidateId: string
  input: BettingInput
}

export type BetPersistPayload = {
  candidateId: string
  record: BettingRecord
}

export type BettingCompositeProtocol =
  | "candidate_load"
  | "bet_evaluate"
  | "bet_persist"
  | "bet_history_load"
  | "score_import"
  | "bet_export"

export type BettingInputPayload = {
  score: number
  confidence: number
  trend: TrendValue
  cost: number
}

export type BettingDecisionPayload = {
  decision: string
  reason: string
}

export type BettingAllocationPayload = {
  allocation: ResourceAllocation
}

export type ScoreImportPayload = {
  score: ScoreObject
}

export type BetExportPayload = {
  record: BettingRecord
  consumer?: "builder" | "radar"
}

export type ScoreImportResult = {
  candidate: BettingCandidate
  input: BettingInput
  contract_response: FlowResponse
}

export type BetExportResult = {
  bet: BetObject
  contract_request: FlowRequest<BetObject>
}




