import type { FeedbackRecord } from "./decisionFeedbackRecorder.ts"

export type TypeBiasAdapterInput = {
  type: string
  current_bias?: number
  feedback_records: FeedbackRecord[]
}

export type TypeBiasAdapterOutput = {
  type: string
  bias: number
  adjusted: boolean
  adjustment_reason: string
  consecutive_count: number
}

const INITIAL_BIAS: Record<string, number> = {
  ads: -0.02,
  content: -0.03,
  analytics: 0.03
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getInitialBias(type: string) {
  return INITIAL_BIAS[type] ?? 0
}

function applyDecay(value: number, decayFactor = 0.98) {
  return value * decayFactor
}

export function adaptTypeBias(input: TypeBiasAdapterInput): TypeBiasAdapterOutput {
  const currentBias = input.current_bias ?? getInitialBias(input.type)
  const recent = input.feedback_records.slice(-5)
  const recentOutcome = recent.filter((record) => record.source === "outcome")
  const recentDecision = recent.filter((record) => record.source === "decision")

  if (recent.length === 0) {
    return {
      type: input.type,
      bias: Number(clamp(applyDecay(currentBias), -0.05, 0.05).toFixed(3)),
      adjusted: false,
      adjustment_reason: "no_feedback",
      consecutive_count: 0
    }
  }

  if (recentOutcome.length > 0) {
    const latestOutcome = recentOutcome[recentOutcome.length - 1].outcome_success
    let consecutiveCount = 0

    for (let index = recentOutcome.length - 1; index >= 0; index -= 1) {
      if (recentOutcome[index].outcome_success === latestOutcome) {
        consecutiveCount += 1
      } else {
        break
      }
    }

    if (consecutiveCount < 3) {
      return {
        type: input.type,
        bias: Number(clamp(applyDecay(currentBias), -0.05, 0.05).toFixed(3)),
        adjusted: false,
        adjustment_reason: "outcome_confirmation_not_met",
        consecutive_count: consecutiveCount
      }
    }

    if (latestOutcome === true) {
      const updatedBias = currentBias + 0.01
      return {
        type: input.type,
        bias: Number(clamp(applyDecay(updatedBias), -0.05, 0.05).toFixed(3)),
        adjusted: true,
        adjustment_reason: "stable_outcome_success_bias_up",
        consecutive_count: consecutiveCount
      }
    }

    if (latestOutcome === false) {
      const updatedBias = currentBias - 0.01
      return {
        type: input.type,
        bias: Number(clamp(applyDecay(updatedBias), -0.05, 0.05).toFixed(3)),
        adjusted: true,
        adjustment_reason: "stable_outcome_failure_bias_down",
        consecutive_count: consecutiveCount
      }
    }
  }

  if (recentDecision.length === 0) {
    return {
      type: input.type,
      bias: Number(clamp(applyDecay(currentBias), -0.05, 0.05).toFixed(3)),
      adjusted: false,
      adjustment_reason: "no_decision_feedback",
      consecutive_count: 0
    }
  }

  const latestDecision = recentDecision[recentDecision.length - 1].decision
  let consecutiveCount = 0

  for (let index = recentDecision.length - 1; index >= 0; index -= 1) {
    if (recentDecision[index].decision === latestDecision) {
      consecutiveCount += 1
    } else {
      break
    }
  }

  if (consecutiveCount < 3) {
    return {
      type: input.type,
      bias: Number(clamp(applyDecay(currentBias), -0.05, 0.05).toFixed(3)),
      adjusted: false,
      adjustment_reason: "confirmation_not_met",
      consecutive_count: consecutiveCount
    }
  }

  if (latestDecision === "invest") {
    const updatedBias = currentBias + 0.01
    return {
      type: input.type,
      bias: Number(clamp(applyDecay(updatedBias), -0.05, 0.05).toFixed(3)),
      adjusted: true,
      adjustment_reason: "stable_invest_bias_up",
      consecutive_count: consecutiveCount
    }
  }

  if (latestDecision === "skip") {
    const updatedBias = currentBias - 0.01
    return {
      type: input.type,
      bias: Number(clamp(applyDecay(updatedBias), -0.05, 0.05).toFixed(3)),
      adjusted: true,
      adjustment_reason: "stable_skip_bias_down",
      consecutive_count: consecutiveCount
    }
  }

  return {
    type: input.type,
    bias: Number(clamp(applyDecay(currentBias), -0.05, 0.05).toFixed(3)),
    adjusted: false,
    adjustment_reason: "hold_keeps_bias",
    consecutive_count: consecutiveCount
  }
}
