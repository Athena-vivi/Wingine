import { scoringObjects } from "../data/scoringObjects.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { ScoringObject } from "../types/scoring.ts"

type Payload = {
  object_id?: string
  object_type?: string
}

type Data = {
  object: ScoringObject
}

export const objectContextLoaderCapability: CapabilityDefinition = {
  name: "object_context_loader",
  purpose: "Load one scoring object and its normalized context for downstream evaluation.",
  input_schema: {
    object_id: "string",
    object_type: "problem|module|output|workflow"
  },
  process_logic: [
    "resolve object by id and type",
    "normalize object fields into scoring context format",
    "attach metadata block",
    "return canonical object context"
  ],
  output_schema: {
    object: "scoring_object"
  },
  state: "idle|loading|ready|error",
  trigger: "called when an object is selected or requested",
  error_handling: {
    object_not_found: "return error state and empty object payload",
    invalid_type: "reject invocation",
    invalid_payload: "return validation error"
  }
}

export function invokeObjectContextLoader(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectId = request.payload.object_id ?? request.context.objectId
  const objectType = request.payload.object_type ?? request.context.objectType

  if (!objectId || !objectType) {
    return {
      request_id: request.request_id,
      capability: objectContextLoaderCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_payload",
        message: "object_id and object_type are required"
      }
    }
  }

  const object = scoringObjects.find((item) => item.id === objectId && item.type === objectType)

  if (!object) {
    return {
      request_id: request.request_id,
      capability: objectContextLoaderCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "object_not_found",
        message: "object could not be resolved"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: objectContextLoaderCapability.name,
    status: "success",
    state: "ready",
    data: {
      object
    },
    error: null
  }
}


