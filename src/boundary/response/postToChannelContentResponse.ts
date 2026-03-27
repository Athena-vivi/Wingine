import type { PostToChannelContentResult } from "../../contracts/usecases/postToChannelContent.ts"

export function assemblePostToChannelContentResponse(
  result: PostToChannelContentResult
): PostToChannelContentResult {
  return {
    decision: result.decision,
    reason: result.reason,
    confidence: result.confidence,
    channel_content: result.channel_content
      ? {
          channel: result.channel_content.channel,
          title: result.channel_content.title,
          body: result.channel_content.body
        }
      : null,
    metadata: result.metadata
      ? {
          build_decision: result.metadata.build_decision,
          feedback_input: {
            build_decision: result.metadata.feedback_input.build_decision
          }
        }
      : undefined
  }
}
