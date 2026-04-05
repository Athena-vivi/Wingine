import { bettingRules } from "../data/bettingRules.ts"
import type { BettingDecision, BettingInput } from "../types/betting.ts"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"
import { bettingDecisionReasons } from "../../../../../control/mapping/bettingDecisionMapping.ts"
import { resolveBettingDecisionPolicy } from "../../../../../control/policy/bettingDecisionPolicy.ts"

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
  const decision = resolveBettingDecisionPolicy(request.payload)

  return {
    request_id: request.request_id,
    capability: decisionResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      decision,
      reason: bettingDecisionReasons[decision],
      matched_rules: [...bettingRules[decision]]
    },
    error: null
  }
}


