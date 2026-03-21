import type { BettingInput } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = BettingInput

type Data = {
  betting_input: BettingInput
}

export const bettingInputResolverCapability: CapabilityDefinition = {
  name: "betting_input_resolver",
  purpose: "Resolve the four required betting inputs for one candidate.",
  input_schema: {
    score: "number",
    confidence: "number",
    trend: "up|flat|down",
    cost: "number"
  },
  process_logic: [
    "validate required inputs",
    "normalize score",
    "normalize confidence",
    "normalize trend",
    "normalize cost"
  ],
  output_schema: {
    betting_input: "betting_input"
  },
  state: "idle|validating|ready|error",
  trigger: "called when betting evaluation starts",
  error_handling: {
    missing_input: "return validation error",
    invalid_range: "reject invocation",
    invalid_trend: "reject invocation"
  }
}

export function invokeBettingInputResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { score, confidence, trend, cost } = request.payload

  if ([score, confidence, trend, cost].some((value) => value === undefined || value === null)) {
    return {
      request_id: request.request_id,
      capability: bettingInputResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "missing_input",
        message: "score, confidence, trend, and cost are required"
      }
    }
  }

  if (score < 0 || score > 5 || confidence < 0 || confidence > 1 || cost < 0) {
    return {
      request_id: request.request_id,
      capability: bettingInputResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_range",
        message: "score, confidence, or cost is out of range"
      }
    }
  }

  if (!["up", "flat", "down"].includes(trend)) {
    return {
      request_id: request.request_id,
      capability: bettingInputResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "invalid_trend",
        message: "trend must be up, flat, or down"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: bettingInputResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      betting_input: {
        score: Number(score),
        confidence: Number(confidence),
        trend,
        cost: Number(cost)
      }
    },
    error: null
  }
}
