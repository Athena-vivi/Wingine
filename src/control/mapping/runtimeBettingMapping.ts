export function mapRuntimeDecisionAllocation(decision: "invest" | "hold" | "skip") {
  return {
    time: decision === "invest" ? "now" : decision === "hold" ? "review" : "defer",
    priority: decision === "invest" ? "high" : decision === "hold" ? "medium" : "low",
    action: decision
  }
}

export function mapRuntimeDecisionReason(decision: "invest" | "hold" | "skip") {
  return decision === "invest"
    ? "weighted_score is at or above the high threshold"
    : decision === "hold"
      ? "weighted_score is between the low and high thresholds"
      : "weighted_score is below the low threshold"
}
