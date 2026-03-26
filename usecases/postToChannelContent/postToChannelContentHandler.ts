import { resolveProblemDecision } from "../../core/betting/problemDecisionResolver.ts"
import { runContentExecutor } from "../../core/execution/contentExecutor.ts"
import { buildContentAsset } from "../../core/modules/content/contentAssetBuilder.ts"
import type { ProblemObject } from "../../core/modules/shared/index.ts"
import { classifyProblem } from "../../core/scoring/problemClassifier.ts"
import { evaluateProblem } from "../../core/scoring/problemEvaluator.ts"

export type PostToChannelContentInput = {
  title?: string
  post_content: string
  comments?: string
  channel: "xiaohongshu" | "twitter" | "substack" | "seo"
  mode?: "auto" | "direct"
}

export type PostToChannelContentResult = {
  decision: "invest" | "skip" | "hold"
  reason: string
  confidence: number
  channel_content: {
    channel: "xiaohongshu" | "twitter" | "substack" | "seo"
    title: string
    body: string
  } | null
}

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

function createProblemObject(input: PostToChannelContentInput): ProblemObject {
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

function buildReason(baseReason: string, mode: "auto" | "direct", decision: "invest" | "skip" | "hold") {
  if (mode === "direct" && decision !== "invest") {
    return `${baseReason}; direct mode bypassed the generation gate`
  }

  return baseReason
}

function buildChannelBody(input: {
  channel: "xiaohongshu" | "twitter" | "substack" | "seo"
  topic: string
  angle: string
  outline: string[]
  coreClaim: string
  comments: string[]
}) {
  const outlineBody = input.outline.map((item) => `- ${item}`).join("\n")
  const commentContext = input.comments.length > 0 ? `\n\nComment context:\n${input.comments.slice(0, 3).join("\n")}` : ""

  if (input.channel === "twitter") {
    return `${input.angle}\n\n${input.coreClaim}\n\n${outlineBody}${commentContext}`
  }

  if (input.channel === "substack") {
    return `${input.topic}\n\n${input.coreClaim}\n\n${outlineBody}${commentContext}`
  }

  if (input.channel === "seo") {
    return `${input.topic}\n\n${input.angle}\n\n${outlineBody}${commentContext}`
  }

  return `${input.angle}\n\n${outlineBody}${commentContext}`
}

export async function postToChannelContentHandler(
  input: PostToChannelContentInput
): Promise<PostToChannelContentResult> {
  const mode = input.mode ?? "auto"
  const problem = createProblemObject(input)
  const classifiedProblem = classifyProblem({ problem })
  const score = evaluateProblem({ problem: classifiedProblem })
  const bet = resolveProblemDecision({ score })
  const decision = String(bet.metadata.custom.decision ?? bet.resource_allocation.action) as "invest" | "skip" | "hold"

  if (mode === "auto" && decision !== "invest") {
    return {
      decision,
      reason: buildReason(String(bet.reason ?? "decision generated"), mode, decision),
      confidence: score.confidence,
      channel_content: null
    }
  }

  const contentAsset = buildContentAsset(classifiedProblem)
  const commentLines = normalizeComments(input.comments ?? "")
  const executionResult = runContentExecutor({
    execution_type: "content",
    payload: {
      title: input.title?.trim() || contentAsset.topic || classifiedProblem.title,
      summary: classifiedProblem.summary,
      body: buildChannelBody({
        channel: input.channel,
        topic: contentAsset.topic,
        angle: contentAsset.angle,
        outline: contentAsset.outline,
        coreClaim: contentAsset.core_claim,
        comments: commentLines
      })
    },
    source_problem_id: classifiedProblem.id,
    decision_ref: bet.id
  })

  const draft = executionResult.output.draft as {
    title: string
    summary: string
    body: string
  }

  return {
    decision,
    reason: buildReason(String(bet.reason ?? "decision generated"), mode, decision),
    confidence: score.confidence,
    channel_content: {
      channel: input.channel,
      title: draft.title,
      body: draft.body
    }
  }
}
