import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"
import type { DimensionScoreEntry, ScoringDimension } from "@/types/scoring"

type Payload = {
  dimensions: Record<ScoringDimension, DimensionScoreEntry>
}

type Data = {
  confidence: number
}

export const confidenceResolverCapability: CapabilityDefinition = {
  name: "confidence_resolver",
  purpose: "Aggregate dimension confidence into one system confidence value.",
  input_schema: {
    dimensions: "dimension_entry_map"
  },
  process_logic: [
    "collect dimension confidence values",
    "calculate aggregate confidence",
    "return normalized confidence result"
  ],
  output_schema: {
    confidence: "number"
  },
  state: "idle|aggregating|ready|error",
  trigger: "called after any dimension confidence update",
  error_handling: {
    missing_confidence: "return incomplete aggregate state",
    invalid_confidence: "reject aggregation"
  }
}

export function invokeConfidenceResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { dimensions } = request.payload

  if (!dimensions) {
    return {
      request_id: request.request_id,
      capability: confidenceResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "missing_confidence",
        message: "dimensions are required"
      }
    }
  }

  const dimensionKeys = Object.keys(dimensions) as ScoringDimension[]
  const confidence = Number(
    (dimensionKeys.reduce((sum, dimension) => sum + dimensions[dimension].confidence, 0) / dimensionKeys.length).toFixed(2)
  )

  return {
    request_id: request.request_id,
    capability: confidenceResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      confidence
    },
    error: null
  }
}
