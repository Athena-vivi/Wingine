import { buildBettingFeedbackStatePatch, buildScoringFeedbackStatePatch } from "../../control/state/builderFeedbackState.ts"
import { applyBuilderRuntimeStatePatch } from "../../execution/state/builderRuntimeStateStore.ts"
import { importBetFeedbackToBuilder } from "../../modules/system/builder/builder/adapters/betFeedbackImportAdapter.ts"
import { importScoreFeedbackToBuilder } from "../../modules/system/builder/builder/adapters/scoreFeedbackImportAdapter.ts"
import type {
  BettingFeedbackImportPayload,
  BuilderProtocolName,
  BuilderProtocolResponse,
  ScoringFeedbackImportPayload
} from "../../modules/system/builder/builder/types/protocol.ts"

export async function runBuilderScoringFeedbackWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: ScoringFeedbackImportPayload
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  const feedback = importScoreFeedbackToBuilder(input.payload.score)
  await applyBuilderRuntimeStatePatch(buildScoringFeedbackStatePatch(feedback))

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      feedback,
      applied_state: {
        object_id: feedback.object_id,
        applied_state: feedback.suggested_state,
        source: "scoring"
      }
    },
    error: null
  }
}

export async function runBuilderBettingFeedbackWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: BettingFeedbackImportPayload
}): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  const feedback = importBetFeedbackToBuilder(input.payload.bet)
  await applyBuilderRuntimeStatePatch(buildBettingFeedbackStatePatch(feedback))

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      feedback,
      applied_state: {
        object_id: feedback.object_id,
        applied_state: feedback.suggested_state,
        source: "betting"
      }
    },
    error: null
  }
}
