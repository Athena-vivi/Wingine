export function mapProblemDecisionReason(decision: "invest" | "skip" | "hold") {
  return decision === "invest"
    ? "problem score passed the minimum builder gate"
    : decision === "hold"
      ? "problem score remains inside the review band"
      : "problem score did not pass the minimum builder gate"
}

export function mapProblemDecisionAllocation(decision: "invest" | "skip" | "hold") {
  return {
    time: decision === "invest" ? "now" : decision === "hold" ? "review" : "defer",
    priority: decision === "invest" ? "high" : decision === "hold" ? "medium" : "low",
    action: decision
  }
}
