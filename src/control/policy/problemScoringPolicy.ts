import type { ProblemObject } from "../../modules/capability/shared/index.ts"

export type ScoreBreakdown = {
  signal_strength: number
  business_value: number
  actionability: number
  frequency_hint: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function averageWeightedScore(breakdown: ScoreBreakdown) {
  return (
    breakdown.signal_strength * 0.3 +
    breakdown.business_value * 0.3 +
    breakdown.actionability * 0.25 +
    breakdown.frequency_hint * 0.15
  )
}

export function resolveProblemScoreBreakdown(problem: ProblemObject): ScoreBreakdown {
  const classifiedType =
    typeof problem.metadata.custom.type === "string" ? problem.metadata.custom.type : "general"
  const trendSignal = problem.metadata.custom.trend_signal === true ? 0.12 : 0
  const toolSignal = problem.metadata.custom.tool_signal === true ? 0.08 : 0
  const serviceSignal = problem.metadata.custom.service_signal === true ? 0.06 : 0
  const recordWorthyBoost = problem.record_worthy ? 0.1 : 0

  if (classifiedType === "ads") {
    return {
      signal_strength: clamp(0.58 + trendSignal + recordWorthyBoost, 0, 1),
      business_value: 0.76,
      actionability: clamp(0.7 + toolSignal, 0, 1),
      frequency_hint: 0.66
    }
  }

  if (classifiedType === "content") {
    return {
      signal_strength: clamp(0.52 + trendSignal + recordWorthyBoost * 0.5, 0, 1),
      business_value: 0.62,
      actionability: 0.58,
      frequency_hint: 0.6
    }
  }

  if (classifiedType === "analytics") {
    return {
      signal_strength: clamp(0.7 + trendSignal + recordWorthyBoost, 0, 1),
      business_value: 0.84,
      actionability: clamp(0.78 + serviceSignal, 0, 1),
      frequency_hint: 0.74
    }
  }

  return {
    signal_strength: clamp(0.45 + trendSignal + recordWorthyBoost, 0, 1),
    business_value: 0.5,
    actionability: clamp(0.48 + toolSignal * 0.5, 0, 1),
    frequency_hint: 0.46
  }
}

export function resolveProblemScoreConfidence(breakdown: ScoreBreakdown) {
  return Number(
    clamp(0.52 + breakdown.signal_strength * 0.15 + breakdown.actionability * 0.08, 0.5, 0.72).toFixed(3)
  )
}
