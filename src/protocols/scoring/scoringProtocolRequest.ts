import type {
  ProtocolCaller,
  ProtocolRequest
} from "../../modules/capability/decision/scoring_module/types/protocol.ts"

const defaultCaller: ProtocolCaller = {
  type: "human-ui",
  id: "scoring-interface"
}

export function createScoringProtocolRequest<TPayload>(
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
