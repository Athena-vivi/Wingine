import type { BetObject } from "../modules/shared/index.ts"

export type DecisionFeedbackInput = {
  bet: BetObject
}

export type FeedbackRecord = {
  source: "decision" | "outcome"
  object_id: string
  type: string
  decision?: "invest" | "skip" | "hold"
  score?: number
  threshold?: number
  outcome_success?: boolean
  outcome_signal?: number
  timestamp: string
}

export type DecisionFeedbackRecord = FeedbackRecord

export type FeedbackRecordInput = {
  record: FeedbackRecord
}

export function recordFeedback(input: FeedbackRecordInput): FeedbackRecord {
  return {
    ...input.record,
    timestamp: input.record.timestamp || new Date().toISOString()
  }
}

export function recordDecisionFeedback(input: DecisionFeedbackInput): DecisionFeedbackRecord {
  const { bet } = input
  const highThreshold =
    typeof bet.metadata.custom.high_threshold === "number"
      ? bet.metadata.custom.high_threshold
      : undefined
  const fallbackThreshold =
    typeof bet.metadata.custom.threshold === "number" ? bet.metadata.custom.threshold : undefined

  return recordFeedback({
    record: {
      source: "decision",
      object_id: bet.object_id,
      type: String(bet.metadata.custom.type ?? "general"),
      score: Number(bet.input.score),
      threshold: Number(highThreshold ?? fallbackThreshold ?? 0.55),
      decision: String(
        bet.metadata.custom.decision ?? bet.resource_allocation.action
      ) as "invest" | "skip" | "hold",
      timestamp: new Date().toISOString()
    }
  })
}
