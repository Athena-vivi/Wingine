import type { FactorBand, TrendValue } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = {
  score: number
  confidence: number
  trend: TrendValue
  cost: number
}

type Data = {
  normalized_factors: {
    scoreBand: FactorBand
    confidenceBand: FactorBand
    trendBand: TrendValue
    costBand: FactorBand
  }
}

function scoreBand(score: number): FactorBand {
  if (score >= 4.2) return "high"
  if (score >= 3.2) return "medium"
  return "low"
}

function confidenceBand(confidence: number): FactorBand {
  if (confidence >= 0.75) return "high"
  if (confidence >= 0.55) return "medium"
  return "low"
}

function costBand(cost: number): FactorBand {
  if (cost >= 4) return "high"
  if (cost >= 2) return "medium"
  return "low"
}

export const factorNormalizerCapability: CapabilityDefinition = {
  name: "factor_normalizer",
  purpose: "Translate raw betting inputs into normalized factor bands.",
  input_schema: {
    score: "number",
    confidence: "number",
    trend: "up|flat|down",
    cost: "number"
  },
  process_logic: [
    "classify score into high medium low",
    "classify confidence into high medium low",
    "classify trend into up flat down",
    "classify cost into high medium low"
  ],
  output_schema: {
    normalized_factors: "normalized_factors"
  },
  state: "idle|normalizing|ready|error",
  trigger: "called after betting input is resolved",
  error_handling: {
    invalid_input: "return error state"
  }
}

export function invokeFactorNormalizer(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { score, confidence, trend, cost } = request.payload

  return {
    request_id: request.request_id,
    capability: factorNormalizerCapability.name,
    status: "success",
    state: "ready",
    data: {
      normalized_factors: {
        scoreBand: scoreBand(score),
        confidenceBand: confidenceBand(confidence),
        trendBand: trend,
        costBand: costBand(cost)
      }
    },
    error: null
  }
}
