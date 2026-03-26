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
