import type { BettingDecision, ResourceAllocation } from "../../modules/capability/decision/betting_module/types/betting.ts"

export const bettingDecisionReasons: Record<BettingDecision, string> = {
  kill: "Low strength or negative direction does not justify continued allocation.",
  hold: "Signal is not strong enough for active allocation.",
  explore: "Signal is promising but still needs controlled learning.",
  double_down: "Strong signal justifies deeper concentration on the same lane.",
  scale: "Strong and stable signal justifies wider rollout."
}

export const bettingDecisionAllocations: Record<BettingDecision, ResourceAllocation> = {
  kill: {
    time: "zero",
    priority: "none",
    action: "remove from active allocation"
  },
  hold: {
    time: "minimal",
    priority: "low",
    action: "watch and wait"
  },
  explore: {
    time: "small",
    priority: "medium",
    action: "run constrained exploration"
  },
  double_down: {
    time: "high",
    priority: "high",
    action: "increase concentration"
  },
  scale: {
    time: "very_high",
    priority: "highest",
    action: "widen rollout"
  }
}
