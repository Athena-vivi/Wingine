import type {
  ProtocolCaller,
  ProtocolRequest
} from "../../modules/capability/decision/betting_module/types/protocol.ts"

const defaultCaller: ProtocolCaller = {
  type: "human-ui",
  id: "betting-interface"
}

export const BETTING_HISTORY_STORAGE_KEY = "betting-history-v1"

export function createBettingProtocolRequest<TPayload>(
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
