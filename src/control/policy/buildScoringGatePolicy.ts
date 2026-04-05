import type {
  DimensionScoreEntry,
  GateResult,
  ScoringDimension
} from "../../modules/capability/decision/scoring_module/types/scoring.ts"

export function resolveBuildGateResult(input: {
  weighted_score: number
  confidence: number
  dimensions: Record<ScoringDimension, DimensionScoreEntry>
}): GateResult {
  const { weighted_score, confidence, dimensions } = input

  if (weighted_score < 2 || dimensions.value.score < 2 || dimensions.quality.score < 2) {
    return "reject"
  }

  if (confidence < 0.55 || dimensions.reliability.score < 2.5) {
    return "hold"
  }

  if (weighted_score >= 4.2 && confidence >= 0.75 && dimensions.value.score >= 4 && dimensions.leverage.score >= 4) {
    return "prioritize"
  }

  if (weighted_score >= 3.5 && confidence >= 0.6 && dimensions.value.score >= 3 && dimensions.quality.score >= 3) {
    return "pass"
  }

  return "improve"
}
