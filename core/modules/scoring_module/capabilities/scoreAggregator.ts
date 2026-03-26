import { scoringWeights } from "../data/scoringWeights.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { DimensionScoreEntry, ScoringDimension, ScoringObjectType } from "../types/scoring.ts"

type Payload = {
  object_type: ScoringObjectType
  dimensions: Record<ScoringDimension, DimensionScoreEntry>
}

type Data = {
  weighted_score: number
  dimension_average: number
}

export const scoreAggregatorCapability: CapabilityDefinition = {
  name: "score_aggregator",
  purpose: "Aggregate dimension scores into weighted score and average score.",
  input_schema: {
    object_type: "problem|module|output|workflow",
    dimensions: "dimension_entry_map"
  },
  process_logic: [
    "load weight configuration by object type",
    "multiply each dimension score by its weight",
    "sum weighted values",
    "calculate dimension average"
  ],
  output_schema: {
    weighted_score: "number",
    dimension_average: "number"
  },
  state: "idle|aggregating|ready|error",
  trigger: "called after any dimension score update",
  error_handling: {
    missing_dimension: "return incomplete aggregate state",
    weight_missing: "return error state"
  }
}

export function invokeScoreAggregator(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { object_type, dimensions } = request.payload

  const weights = scoringWeights[object_type]

  if (!weights || !dimensions) {
    return {
      request_id: request.request_id,
      capability: scoreAggregatorCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "weight_missing",
        message: "weights or dimensions missing"
      }
    }
  }

  const dimensionKeys = Object.keys(dimensions) as ScoringDimension[]
  const weightedScore = Number(
    dimensionKeys.reduce((sum, dimension) => sum + dimensions[dimension].score * weights[dimension], 0).toFixed(2)
  )
  const dimensionAverage = Number(
    (dimensionKeys.reduce((sum, dimension) => sum + dimensions[dimension].score, 0) / dimensionKeys.length).toFixed(2)
  )

  return {
    request_id: request.request_id,
    capability: scoreAggregatorCapability.name,
    status: "success",
    state: "ready",
    data: {
      weighted_score: weightedScore,
      dimension_average: dimensionAverage
    },
    error: null
  }
}


