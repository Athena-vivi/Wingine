import { bettingHistory } from "../data/bettingHistory.ts"
import type { BettingRecord } from "../types/betting.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"

type Payload = {
  object_id?: string
}

type Data = {
  history: BettingRecord[]
}

export const bettingHistoryManagerCapability: CapabilityDefinition = {
  name: "betting_history_manager",
  purpose: "Load historical betting decisions for one candidate.",
  input_schema: {
    object_id: "string"
  },
  process_logic: [
    "query history store by object id",
    "sort decisions by time descending",
    "return normalized history list"
  ],
  output_schema: {
    history: "betting_record[]"
  },
  state: "idle|loading|ready|error",
  trigger: "called on candidate load or history request",
  error_handling: {
    history_missing: "return empty list",
    history_corrupt: "return error state"
  }
}

export function invokeBettingHistoryManager(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectId = request.payload.object_id ?? request.context.objectId

  if (!objectId) {
    return {
      request_id: request.request_id,
      capability: bettingHistoryManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "history_missing",
        message: "object_id is required"
      }
    }
  }

  const history = bettingHistory
    .filter((record) => record.objectId === objectId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return {
    request_id: request.request_id,
    capability: bettingHistoryManagerCapability.name,
    status: "success",
    state: "ready",
    data: {
      history
    },
    error: null
  }
}


