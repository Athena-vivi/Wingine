import type { DecisionFeedbackRecord } from "../../feedback/decisionFeedbackRecorder.ts"
import { adaptThresholdState, type ThresholdAdapterInput, type ThresholdAdapterOutput } from "../../../../control/state/thresholdState.ts"

export function adaptThreshold(input: ThresholdAdapterInput): ThresholdAdapterOutput {
  return adaptThresholdState(input)
}
