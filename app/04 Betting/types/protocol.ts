import type { BetObject, FlowRequest, FlowResponse, ScoreObject } from "../../SharedContracts"
import type { BettingCandidate, BettingInput, BettingObjectType, BettingRecord, ResourceAllocation, TrendValue } from "@/types/betting"

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

export type ProtocolCaller = {
  type: "human-ui" | "agent" | "api"
  id: string
}

export type ProtocolContext = {
  objectId?: string
  objectType?: BettingObjectType
}

export type CapabilityDefinition = {
  name: string
  purpose: string
  input_schema: Record<string, string>
  process_logic: string[]
  output_schema: Record<string, string>
  state: string
  trigger: string
  error_handling: Record<string, string>
}

export type ProtocolRequest<TPayload = Record<string, unknown>> = {
  request_id: string
  capability: string
  caller: ProtocolCaller
  payload: TPayload
  context: ProtocolContext
}

export type ProtocolResponse<TData = Record<string, unknown>> = {
  request_id: string
  capability: string
  status: "success" | "error"
  state: CapabilityState
  data: TData | null
  error: {
    code: string
    message: string
  } | null
}

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
