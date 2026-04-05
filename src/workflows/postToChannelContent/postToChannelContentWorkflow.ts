import { decideBuild } from "../../modules/capability/decision/buildDecision.ts"
import { decideProblem } from "../../modules/capability/decision/problemDecision.ts"
import { runContentExecutor } from "../../modules/capability/execution/contentExecutor.ts"
import { build } from "../../modules/system/builder/build.ts"
import type { ProblemObject } from "../../modules/capability/shared/index.ts"
import { resolvePostDecisionReason } from "../../control/policy/postToChannelPolicy.ts"
import type { BettingInput } from "../../modules/capability/decision/betting_module/types/betting.ts"
import type {
  PostToChannelContentInput,
  PostToChannelContentResult
} from "../../contracts/usecases/postToChannelContent.ts"

function normalizeComments(comments: string) {
  return comments
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function createBuildDecisionRequest<TPayload>(
  capability: string,
  payload: TPayload,
  context: {
    objectId?: string
    objectType?: "problem" | "module" | "output" | "workflow"
  }
) {
  return {
    request_id: `${capability}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    capability,
    caller: {
      type: "api" as const,
      id: "post-to-channel-content-workflow"
    },
    payload,
    context
  }
}

function createBuildDecisionInput(input: {
  contentAsset: {
    topic: string
    angle: string
    core_claim: string
    outline: string[]
  }
  confidence: number
  hasComments: boolean
}): BettingInput {
  const completenessScore =
    (input.contentAsset.topic ? 1.25 : 0) +
    (input.contentAsset.angle ? 1.25 : 0) +
    (input.contentAsset.core_claim ? 1.25 : 0) +
    Math.min(1.25, input.contentAsset.outline.length * 0.3)

  return {
    score: Number(Math.min(5, completenessScore).toFixed(2)),
    confidence: Number(Math.max(0, Math.min(1, input.confidence)).toFixed(3)),
    trend: input.hasComments ? "up" : "flat",
    cost: 1
  }
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

export async function runPostToChannelContentWorkflow(input: {
  request: PostToChannelContentInput
  problem: ProblemObject
}): Promise<PostToChannelContentResult> {
  const mode = input.request.mode ?? "auto"
  const problemDecision = decideProblem(input.problem)
  const classifiedProblem = problemDecision.metadata?.problem as ProblemObject
  const score = problemDecision.metadata?.score_object as {
    confidence: number
  }
  const bet = problemDecision.metadata?.bet_object as {
    id: string
  }
  const decision = String(problemDecision.metadata?.decision ?? "skip") as "invest" | "skip" | "hold"
  const reason = resolvePostDecisionReason({
    baseReason: String(problemDecision.strategy ?? "decision generated"),
    mode,
    decision
  })
  const confidence = Number(problemDecision.confidence ?? score.confidence)

  if (mode === "auto" && decision !== "invest") {
    return {
      decision,
      reason,
      confidence,
      channel_content: null
    }
  }

  const contentAsset = build({
    mode: "content",
    problem: classifiedProblem
  })
  const buildDecision = decideBuild({
    createRequest: createBuildDecisionRequest,
    requestContext: {
      objectId: classifiedProblem.id,
      objectType: "output"
    },
    buildResult: {
      input: createBuildDecisionInput({
        contentAsset,
        confidence,
        hasComments: Boolean(input.request.comments?.trim())
      })
    }
  })
  const commentLines = normalizeComments(input.request.comments ?? "")
  const executionResult = runContentExecutor({
    execution_type: "content",
    payload: {
      title: input.request.title?.trim() || contentAsset.topic || classifiedProblem.title,
      summary: classifiedProblem.summary,
      body: buildChannelBody({
        channel: input.request.channel,
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
    reason,
    confidence,
    channel_content: {
      channel: input.request.channel,
      title: draft.title,
      body: draft.body
    },
    metadata: {
      build_decision: buildDecision.status === "success" ? buildDecision.data : null,
      feedback_input: {
        build_decision: buildDecision.status === "success" ? buildDecision.data : null
      }
    }
  }
}
