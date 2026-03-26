import { bettingRules } from "@/data/bettingRules"
import type { BettingDecision, BettingInput } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = BettingInput

type Data = {
  decision: BettingDecision
  reason: string
  matched_rules: string[]
}

export const decisionResolverCapability: CapabilityDefinition = {
  name: "decision_resolver",
  purpose: "Resolve one fixed betting decision from normalized inputs and decision rules.",
  input_schema: {
    score: "number",
    confidence: "number",
    trend: "up|flat|down",
    cost: "number"
  },
  process_logic: [
    "apply decision priority order",
    "evaluate kill rules",
    "evaluate scale rules",
    "evaluate double_down rules",
    "evaluate explore rules",
    "fallback to hold"
  ],
  output_schema: {
    decision: "kill|hold|explore|double_down|scale",
    reason: "string",
    matched_rules: "string[]"
  },
  state: "idle|evaluating|ready|error",
  trigger: "called after factor normalization",
  error_handling: {
    rule_failure: "return error state",
    incomplete_input: "reject decision evaluation"
  }
}

export function invokeDecisionResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { score, confidence, trend, cost } = request.payload

  let decision: BettingDecision = "hold"

  if (score < 2.8 || (trend === "down" && cost >= 2)) {
    decision = "kill"
  } else if (score >= 4.4 && confidence >= 0.75 && cost < 2 && (trend === "up" || trend === "flat")) {
    decision = "scale"
  } else if (score >= 4.0 && confidence >= 0.6 && trend === "up" && cost < 4) {
    decision = "double_down"
  } else if (score >= 3.2 && score < 4.0 && confidence >= 0.45 && cost < 4 && (trend === "up" || trend === "flat")) {
    decision = "explore"
  } else if (confidence < 0.55 || (score >= 2.8 && score < 3.4 && (trend === "flat" || trend === "down"))) {
    decision = "hold"
  }

  const reasonMap: Record<BettingDecision, string> = {
    kill: "Low strength or negative direction does not justify continued allocation.",
    hold: "Signal is not strong enough for active allocation.",
    explore: "Signal is promising but still needs controlled learning.",
    double_down: "Strong signal justifies deeper concentration on the same lane.",
    scale: "Strong and stable signal justifies wider rollout."
  }

  return {
    request_id: request.request_id,
    capability: decisionResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      decision,
      reason: reasonMap[decision],
      matched_rules: [...bettingRules[decision]]
    },
    error: null
  }
}
