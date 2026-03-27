import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { EvaluationRecord, ScoringDimension } from "../types/scoring.ts"

type Payload = {
  evaluation: EvaluationRecord
  dimension: ScoringDimension
  field: "score" | "confidence" | "note" | "evidence"
  value: number | string | string[]
}

type Data = {
  evaluation: EvaluationRecord
}

export const dimensionScoreManagerCapability: CapabilityDefinition = {
  name: "dimension_score_manager",
  purpose: "Create, update, and validate dimension-level scoring data.",
  input_schema: {
    evaluation: "evaluation_record",
    dimension: "value|quality|reliability|leverage",
    field: "score|confidence|note|evidence",
    value: "number|string|string[]"
  },
  process_logic: [
    "validate dimension name",
    "validate score range",
    "validate confidence range",
    "normalize note and evidence",
    "write dimension entry into evaluation record"
  ],
  output_schema: {
    evaluation: "evaluation_record"
  },
  state: "idle|validating|updated|error",
  trigger: "called whenever a dimension input changes",
  error_handling: {
    invalid_score_range: "reject update",
    invalid_confidence_range: "reject update",
    invalid_dimension: "reject update"
  }
}

export function invokeDimensionScoreManager(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { evaluation, dimension, field, value } = request.payload

  if (!evaluation?.dimensions[dimension]) {
    return {
      request_id: request.request_id,
      capability: dimensionScoreManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_dimension",
        message: "dimension is invalid"
      }
    }
  }

  if (field === "score" && (Number(value) < 0 || Number(value) > 5)) {
    return {
      request_id: request.request_id,
      capability: dimensionScoreManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_score_range",
        message: "score must be between 0 and 5"
      }
    }
  }

  if (field === "confidence" && (Number(value) < 0 || Number(value) > 1)) {
    return {
      request_id: request.request_id,
      capability: dimensionScoreManagerCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_confidence_range",
        message: "confidence must be between 0 and 1"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: dimensionScoreManagerCapability.name,
    status: "success",
    state: "updated",
    data: {
      evaluation: {
        ...evaluation,
        dimensions: {
          ...evaluation.dimensions,
          [dimension]: {
            ...evaluation.dimensions[dimension],
            [field]: value
          }
        }
      }
    },
    error: null
  }
}


