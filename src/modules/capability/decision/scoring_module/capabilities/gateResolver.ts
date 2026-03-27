import { scoringGateRules } from "../data/scoringGateRules.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import type { DimensionScoreEntry, GateResult, ScoringDimension } from "../types/scoring.ts"
import { resolveBuildGateResult } from "../../../../../control/policy/buildScoringGatePolicy.ts"

type Payload = {
  weighted_score: number
  confidence: number
  dimensions: Record<ScoringDimension, DimensionScoreEntry>
}

type Data = {
  result: GateResult
  matched_rules: string[]
}

export const gateResolverCapability: CapabilityDefinition = {
  name: "gate_resolver",
  purpose: "Resolve final decision state from scores, confidence, and threshold rules.",
  input_schema: {
    weighted_score: "number",
    confidence: "number",
    dimensions: "dimension_entry_map"
  },
  process_logic: [
    "load gate rules",
    "evaluate reject conditions",
    "evaluate hold conditions",
    "evaluate prioritize conditions",
    "evaluate pass conditions",
    "fallback to improve condition",
    "return matched result and matched rules"
  ],
  output_schema: {
    result: "reject|hold|improve|pass|prioritize",
    matched_rules: "string[]"
  },
  state: "idle|evaluating|ready|error",
  trigger: "called after aggregate score or aggregate confidence changes",
  error_handling: {
    missing_inputs: "return incomplete decision state",
    rule_evaluation_failure: "return error state"
  }
}

export function invokeGateResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { weighted_score, confidence, dimensions } = request.payload

  if (weighted_score === undefined || confidence === undefined || !dimensions) {
    return {
      request_id: request.request_id,
      capability: gateResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "missing_inputs",
        message: "weighted_score, confidence, and dimensions are required"
      }
    }
  }

  const result = resolveBuildGateResult({
    weighted_score,
    confidence,
    dimensions
  }) as GateResult

  return {
    request_id: request.request_id,
    capability: gateResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      result,
      matched_rules: [...scoringGateRules[result]]
    },
    error: null
  }
}


