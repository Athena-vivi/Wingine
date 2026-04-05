import type {
  BettingCandidate,
  BettingInput,
  BettingRecord
} from "../modules/capability/decision/betting_module/types/betting.ts"

export type BettingWorkspaceState = {
  selectedCandidateId: string
  candidates: BettingCandidate[]
  currentCandidate: BettingCandidate
  currentInput: BettingInput
  inputSource: string
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
