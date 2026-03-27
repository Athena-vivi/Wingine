import type {
  BettingFeedbackImportPayload,
  BuilderProtocolName,
  BuilderProtocolResponse,
  ProblemImportPayload,
  ScoringFeedbackImportPayload,
  WorkflowExportPayload
} from "../../modules/system/builder/builder/types/protocol.ts"

export async function runBuilderProblemImportProtocol(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: ProblemImportPayload
  importProblem: (problem: ProblemImportPayload["problem"]) => Record<string, unknown>
  evaluateGate: (problem: ProblemImportPayload["problem"]) => Record<string, unknown>
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      problem: input.importProblem(input.payload.problem),
      contract_response: input.evaluateGate(input.payload.problem)
    },
    error: null
  }
}

export async function runBuilderWorkflowExportProtocol(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: WorkflowExportPayload
  exportWorkflow: (payload: WorkflowExportPayload) => Record<string, unknown>
  buildRequest: (payload: WorkflowExportPayload) => Record<string, unknown>
  evaluateGate: (workflowObject: Record<string, unknown>) => Record<string, unknown>
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  const workflow = input.exportWorkflow(input.payload)

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      workflow,
      contract_request: input.buildRequest(input.payload),
      contract_response: input.evaluateGate(workflow)
    },
    error: null
  }
}

export async function runBuilderScoringFeedbackProtocol(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: ScoringFeedbackImportPayload
  importFeedback: (score: ScoringFeedbackImportPayload["score"]) => Record<string, unknown>
  applyFeedback: (feedback: Record<string, unknown>) => Promise<Record<string, unknown>>
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  const feedback = input.importFeedback(input.payload.score)
  const applied = await input.applyFeedback(feedback)

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      feedback,
      applied_state: applied
    },
    error: null
  }
}

export async function runBuilderBettingFeedbackProtocol(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: BettingFeedbackImportPayload
  importFeedback: (bet: BettingFeedbackImportPayload["bet"]) => Record<string, unknown>
  applyFeedback: (feedback: Record<string, unknown>) => Promise<Record<string, unknown>>
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  const feedback = input.importFeedback(input.payload.bet)
  const applied = await input.applyFeedback(feedback)

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      feedback,
      applied_state: applied
    },
    error: null
  }
}
