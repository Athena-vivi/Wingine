import { bettingCandidates } from "@/data/bettingCandidates"
import type { BettingCandidate } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = {
  object_id?: string
  object_type?: string
}

type Data = {
  candidate: BettingCandidate
}

export const candidatePoolLoaderCapability: CapabilityDefinition = {
  name: "candidate_pool_loader",
  purpose: "Load one betting candidate from the allowed object pool.",
  input_schema: {
    object_id: "string",
    object_type: "problem|module|output|workflow"
  },
  process_logic: [
    "validate object type",
    "resolve object from candidate pool",
    "return normalized candidate record"
  ],
  output_schema: {
    candidate: "betting_candidate"
  },
  state: "idle|loading|ready|error",
  trigger: "called when a candidate is selected or requested",
  error_handling: {
    candidate_not_found: "return error state",
    invalid_object_type: "reject invocation"
  }
}

export function invokeCandidatePoolLoader(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectId = request.payload.object_id ?? request.context.objectId
  const objectType = request.payload.object_type ?? request.context.objectType

  if (!objectId || !objectType) {
    return {
      request_id: request.request_id,
      capability: candidatePoolLoaderCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_object_type",
        message: "object_id and object_type are required"
      }
    }
  }

  const candidate = bettingCandidates.find((item) => item.id === objectId && item.objectType === objectType)

  if (!candidate) {
    return {
      request_id: request.request_id,
      capability: candidatePoolLoaderCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "candidate_not_found",
        message: "candidate could not be resolved"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: candidatePoolLoaderCapability.name,
    status: "success",
    state: "ready",
    data: {
      candidate
    },
    error: null
  }
}
