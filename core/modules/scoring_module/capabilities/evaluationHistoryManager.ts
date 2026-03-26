import { scoringHistory } from "../data/scoringHistory.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { EvaluationRecord } from "../types/scoring.ts"

type Payload = {
  object_id?: string
}

type Data = {
  history: EvaluationRecord[]
}

export const evaluationHistoryManagerCapability: CapabilityDefinition = {
  name: "evaluation_history_manager",
  purpose: "Load and return historical evaluation records for the requested object.",
  input_schema: {
    object_id: "string"
  },
  process_logic: [
    "query history store by object id",
    "sort records by timestamp descending",
    "normalize history payload"
  ],
  output_schema: {
    history: "evaluation_record[]"
  },
  state: "idle|loading|ready|error",
  trigger: "called when active object changes or history is requested",
  error_handling: {
    history_missing: "return empty history list",
    history_corrupt: "return error state"
  }
}

export function invokeEvaluationHistoryManager(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectId = request.payload.object_id ?? request.context.objectId

  if (!objectId) {
    return {
      request_id: request.request_id,
      capability: evaluationHistoryManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "history_missing",
        message: "object_id is required"
      }
    }
  }

  const history = scoringHistory
    .filter((record) => record.objectId === objectId)
    .sort((a, b) => b.execution.timestamp.localeCompare(a.execution.timestamp))

  return {
    request_id: request.request_id,
    capability: evaluationHistoryManagerCapability.name,
    status: "success",
    state: "ready",
    data: {
      history
    },
    error: null
  }
}


