export type ExecutionRequest = {
  execution_type: "content" | "tool" | "agent" | "data"
  payload: Record<string, unknown>
  source_problem_id: string
  decision_ref: string
}

export type ExecutionResult = {
  execution_id: string
  status: "success" | "failed"
  output: Record<string, unknown>
}

export type ExecutionGateInput<TProblem = unknown, TBet = unknown> = {
  problem: TProblem
  bet: TBet
}

export type ExecutionResultRecord<TDraft = Record<string, unknown> | null> = {
  object_id: string
  type: string
  decision: string
  executed: boolean
  status: "ready_to_publish" | "stored" | "discarded"
  draft: TDraft
  published: boolean
  user_feedback?: string
  performance?: Record<string, unknown>
}
