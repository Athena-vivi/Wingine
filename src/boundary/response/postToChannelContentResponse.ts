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
      : null
  }
}
