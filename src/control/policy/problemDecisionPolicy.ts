export function resolveProblemDecisionPolicy(weightedScore: number): "invest" | "skip" {
  return weightedScore > 0.5 ? "invest" : "skip"
}
