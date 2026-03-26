import { costDefaults } from "../data/costDefaults.ts"
import { scoringSnapshots } from "../data/scoringSnapshots.ts"
import type { BettingInput } from "../types/betting.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"

type Payload = {
  object_id?: string
  object_type?: string
}

type Data = {
  betting_input: BettingInput
  source: "scoring-adapter"
}

export const scoringSignalAdapterCapability: CapabilityDefinition = {
  name: "scoring_signal_adapter",
  purpose: "Resolve betting input defaults from normalized scoring output and local cost defaults.",
  input_schema: {
    object_id: "string",
    object_type: "problem|module|output|workflow"
  },
  process_logic: [
    "resolve latest scoring snapshot by object id and type",
    "read score and confidence from scoring snapshot",
    "read trend from scoring snapshot",
    "read cost default from local cost map",
    "return betting input seed"
  ],
  output_schema: {
    betting_input: "betting_input",
    source: "string"
  },
  state: "idle|loading|ready|error",
  trigger: "called when betting candidate loads and betting defaults are needed",
  error_handling: {
    snapshot_missing: "return fallback betting input",
    invalid_object_type: "reject invocation"
  }
}

export function invokeScoringSignalAdapter(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectId = request.payload.object_id ?? request.context.objectId
  const objectType = request.payload.object_type ?? request.context.objectType

  if (!objectId || !objectType) {
    return {
      request_id: request.request_id,
      capability: scoringSignalAdapterCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_object_type",
        message: "object_id and object_type are required"
      }
    }
  }

  const snapshot = scoringSnapshots.find((item) => item.objectId === objectId && item.objectType === objectType)

  if (!snapshot) {
    return {
      request_id: request.request_id,
      capability: scoringSignalAdapterCapability.name,
      status: "success",
      state: "ready",
      data: {
        betting_input: {
          score: 3,
          confidence: 0.6,
          trend: "flat",
          cost: costDefaults[objectId] ?? 2
        },
        source: "scoring-adapter"
      },
      error: null
    }
  }

  return {
    request_id: request.request_id,
    capability: scoringSignalAdapterCapability.name,
    status: "success",
    state: "ready",
    data: {
      betting_input: {
        score: snapshot.score,
        confidence: snapshot.confidence,
        trend: snapshot.trend,
        cost: costDefaults[objectId] ?? 2
      },
      source: "scoring-adapter"
    },
    error: null
  }
}


