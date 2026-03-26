import type { DecisionFeedbackRecord } from "./decisionFeedbackRecorder.ts"

export type ThresholdAdapterInput = {
  type: string
  base_high_threshold: number
  base_low_threshold: number
  feedback_records: DecisionFeedbackRecord[]
  window_size?: number
  current_round: number
  last_adjust_round?: number | null
  confirmation_count?: number
  cooldown_rounds?: number
}

export type ThresholdAdapterOutput = {
  type: string
  high_threshold: number
  low_threshold: number
  invest_ratio: number
  skip_ratio: number
  sample_size: number
  adjusted: boolean
  adjustment_reason: string
  consecutive_count: number
  last_adjust_round: number | null
  stability_factor: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function adaptThreshold(input: ThresholdAdapterInput): ThresholdAdapterOutput {
  const recent = input.feedback_records.slice(-(input.window_size ?? 5))
  const sampleSize = recent.length
  const confirmationCount = input.confirmation_count ?? 3
  const cooldownRounds = input.cooldown_rounds ?? 2

  if (sampleSize === 0) {
    return {
      type: input.type,
      high_threshold: input.base_high_threshold,
      low_threshold: input.base_low_threshold,
      invest_ratio: 0,
      skip_ratio: 0,
      sample_size: 0,
      adjusted: false,
      adjustment_reason: "no_feedback",
      consecutive_count: 0,
      last_adjust_round: input.last_adjust_round ?? null,
      stability_factor: 0
    }
  }

  const investCount = recent.filter((record) => record.decision === "invest").length
  const skipCount = recent.filter((record) => record.decision === "skip").length
  const investRatio = investCount / sampleSize
  const skipRatio = skipCount / sampleSize
  const latestDecision = recent[recent.length - 1].decision
  let consecutiveCount = 0

  for (let index = recent.length - 1; index >= 0; index -= 1) {
    if (recent[index].decision === latestDecision) {
      consecutiveCount += 1
    } else {
      break
    }
  }

  if (input.last_adjust_round != null && input.current_round - input.last_adjust_round < cooldownRounds) {
    return {
      type: input.type,
      high_threshold: input.base_high_threshold,
      low_threshold: input.base_low_threshold,
      invest_ratio: Number(investRatio.toFixed(3)),
      skip_ratio: Number(skipRatio.toFixed(3)),
      sample_size: sampleSize,
      adjusted: false,
      adjustment_reason: "cooldown_active",
      consecutive_count: consecutiveCount,
      last_adjust_round: input.last_adjust_round,
      stability_factor: 0
    }
  }

  if (consecutiveCount < confirmationCount) {
    return {
      type: input.type,
      high_threshold: input.base_high_threshold,
      low_threshold: input.base_low_threshold,
      invest_ratio: Number(investRatio.toFixed(3)),
      skip_ratio: Number(skipRatio.toFixed(3)),
      sample_size: sampleSize,
      adjusted: false,
      adjustment_reason: "confirmation_not_met",
      consecutive_count: consecutiveCount,
      last_adjust_round: input.last_adjust_round ?? null,
      stability_factor: Number((Math.min(1, consecutiveCount / 5)).toFixed(3))
    }
  }

  const stabilityFactor = Math.min(1, consecutiveCount / 5)
  let delta = 0
  let adjustmentReason = "no_adjustment"

  if (latestDecision === "skip" && skipRatio > 0.8) {
    delta = -0.02 * stabilityFactor
    adjustmentReason = "confirmed_skip_pressure"
  } else if (latestDecision === "invest" && investRatio > 0.8) {
    delta = 0.02 * stabilityFactor
    adjustmentReason = "confirmed_invest_pressure"
  } else {
    return {
      type: input.type,
      high_threshold: input.base_high_threshold,
      low_threshold: input.base_low_threshold,
      invest_ratio: Number(investRatio.toFixed(3)),
      skip_ratio: Number(skipRatio.toFixed(3)),
      sample_size: sampleSize,
      adjusted: false,
      adjustment_reason: "ratio_not_extreme_enough",
      consecutive_count: consecutiveCount,
      last_adjust_round: input.last_adjust_round ?? null,
      stability_factor: Number(stabilityFactor.toFixed(3))
    }
  }

  return {
    type: input.type,
    high_threshold: Number(clamp(input.base_high_threshold + delta, 0.45, 0.7).toFixed(3)),
    low_threshold: Number(clamp(input.base_low_threshold + delta, 0.45, 0.7).toFixed(3)),
    invest_ratio: Number(investRatio.toFixed(3)),
    skip_ratio: Number(skipRatio.toFixed(3)),
    sample_size: sampleSize,
    adjusted: true,
    adjustment_reason: adjustmentReason,
    consecutive_count: consecutiveCount,
    last_adjust_round: input.current_round,
    stability_factor: Number(stabilityFactor.toFixed(3))
  }
}
