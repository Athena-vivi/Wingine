import type { BettingDecision, BettingInput } from "../../modules/capability/decision/betting_module/types/betting.ts"

export function resolveBettingDecisionPolicy(input: BettingInput): BettingDecision {
  const { score, confidence, trend, cost } = input

  if (score < 2.8 || (trend === "down" && cost >= 2)) {
    return "kill"
  }

  if (score >= 4.4 && confidence >= 0.75 && cost < 2 && (trend === "up" || trend === "flat")) {
    return "scale"
  }

  if (score >= 4.0 && confidence >= 0.6 && trend === "up" && cost < 4) {
    return "double_down"
  }

  if (score >= 3.2 && score < 4.0 && confidence >= 0.45 && cost < 4 && (trend === "up" || trend === "flat")) {
    return "explore"
  }

  if (confidence < 0.55 || (score >= 2.8 && score < 3.4 && (trend === "flat" || trend === "down"))) {
    return "hold"
  }

  return "hold"
}
