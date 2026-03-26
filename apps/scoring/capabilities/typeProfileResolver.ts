import { scoringProfiles } from "@/data/scoringProfiles"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"
import type { ScoringObjectType, TypeProfile } from "@/types/scoring"

type Payload = {
  object_type?: ScoringObjectType
}

type Data = {
  profile: TypeProfile
}

export const typeProfileResolverCapability: CapabilityDefinition = {
  name: "type_profile_resolver",
  purpose: "Resolve the scoring profile for the requested object type.",
  input_schema: {
    object_type: "problem|module|output|workflow"
  },
  process_logic: [
    "match object type to profile registry",
    "load dimension meanings",
    "load high-score rules",
    "load low-score rules"
  ],
  output_schema: {
    profile: "type_profile"
  },
  state: "idle|resolving|ready|error",
  trigger: "called after object context is loaded",
  error_handling: {
    profile_missing: "return error state with unresolved profile",
    invalid_type: "reject invocation"
  }
}

export function invokeTypeProfileResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const objectType = request.payload.object_type ?? request.context.objectType

  if (!objectType) {
    return {
      request_id: request.request_id,
      capability: typeProfileResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_type",
        message: "object_type is required"
      }
    }
  }

  const profile = scoringProfiles.find((item) => item.objectType === objectType)

  if (!profile) {
    return {
      request_id: request.request_id,
      capability: typeProfileResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "profile_missing",
        message: "profile could not be resolved"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: typeProfileResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      profile
    },
    error: null
  }
}
