import type { ProblemObject } from "../../modules/capability/shared/index.ts"
import type { PostToChannelContentInput } from "../../contracts/usecases/postToChannelContent.ts"

function summarizePost(postContent: string) {
  const compact = postContent.replace(/\s+/g, " ").trim()
  if (!compact) {
    return "Empty post content."
  }

  return compact.slice(0, 160)
}

function normalizeComments(comments: string) {
  return comments
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function inferTitle(title: string, postContent: string) {
  const trimmedTitle = title.trim()
  if (trimmedTitle) {
    return trimmedTitle
  }

  const compact = postContent.replace(/\s+/g, " ").trim()
  return compact.slice(0, 80) || "Untitled Post"
}

export function transformPostToChannelContentRequest(
  input: PostToChannelContentInput
): ProblemObject {
  const now = new Date().toISOString()
  const normalizedComments = normalizeComments(input.comments ?? "")
  const normalizedProblem = input.post_content.trim()
  const inferredTitle = inferTitle(input.title ?? "", input.post_content)
  const summary = summarizePost(input.post_content)

  return {
    id: `problem_post_${Date.now()}`,
    type: "problem",
    source: {
      system: "external",
      origin_id: "post_to_channel_content",
      origin_ref: "usecases/postToChannelContent/postToChannelContentHandler"
    },
    status: "qualified",
    metadata: {
      tags: ["post_material", input.channel],
      labels: [input.mode ?? "auto"],
      custom: {
        audience: "general users",
        input_channel: input.channel,
        comments_count: normalizedComments.length,
        trend_signal: normalizedComments.length >= 3,
        tool_signal: /\btool|software|automation|dashboard\b/i.test(input.post_content),
        service_signal: /\bservice|agency|consulting|client\b/i.test(input.post_content)
      }
    },
    timestamps: {
      created_at: now,
      updated_at: now,
      observed_at: now
    },
    title: inferredTitle,
    summary,
    description: normalizedComments.join(" ").slice(0, 500) || undefined,
    normalized_problem: normalizedProblem,
    record_worthy: normalizedProblem.length >= 40 || normalizedComments.length >= 2
  }
}
