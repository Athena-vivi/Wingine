import type { ScoreObject } from "../../modules/capability/shared/index.ts"

export function resolveRuntimeDecisionContext(score: ScoreObject) {
  const custom = score.metadata.custom ?? {}
  const customHighThreshold =
    typeof custom.high_threshold === "number" ? custom.high_threshold : undefined
  const customLowThreshold =
    typeof custom.low_threshold === "number" ? custom.low_threshold : undefined
  const type = String(custom.type ?? custom.structural_signal ?? "general")

  if (customHighThreshold !== undefined && customLowThreshold !== undefined) {
    return {
      type,
      high_threshold: customHighThreshold,
      low_threshold: customLowThreshold
    }
  }

  if (type === "ads" || type === "content" || type === "analytics") {
    return { type, high_threshold: 0.65, low_threshold: 0.62 }
  }

  return { type: "general", high_threshold: 0.65, low_threshold: 0.62 }
}

export function resolveRuntimeWeightedDecision(
  weightedScore: number,
  context: { high_threshold: number; low_threshold: number }
): "invest" | "hold" | "skip" {
  if (weightedScore >= context.high_threshold) {
    return "invest"
  }

  if (weightedScore < context.low_threshold) {
    return "skip"
  }

  return "hold"
}
