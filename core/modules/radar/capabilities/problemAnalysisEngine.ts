import OpenAI from "openai"

import type { AnalyzeResponse, RadarCapabilityDefinition, RedditPostData } from "../types/radar.ts"

export type ProblemAnalysisModelProvider = "openrouter" | "openai" | "glm" | "none"

export type ProblemAnalysisLLMConfig = {
  provider?: ProblemAnalysisModelProvider
  model?: string
}

type ResolvedLLMRuntime = {
  provider: Exclude<ProblemAnalysisModelProvider, "none"> | null
  model: string | null
  client: OpenAI | null
}

function resolveDefaultProvider(): Exclude<ProblemAnalysisModelProvider, "none"> | null {
  if (process.env.GLM_API_KEY || process.env.ZAI_API_KEY) return "glm"
  if (process.env.OPENROUTER_API_KEY) return "openrouter"
  if (process.env.OPENAI_API_KEY) return "openai"
  return null
}

function resolveLLMRuntime(selection?: ProblemAnalysisLLMConfig): ResolvedLLMRuntime {
  const provider = selection?.provider === "none"
    ? null
    : selection?.provider
      ? selection.provider
      : resolveDefaultProvider()

  if (!provider) {
    return {
      provider: null,
      model: null,
      client: null
    }
  }

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return { provider: null, model: null, client: null }
    }

    return {
      provider,
      model: selection?.model || process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
      client: new OpenAI({
        apiKey,
        baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
        defaultHeaders: {
          ...(process.env.OPENROUTER_SITE_URL
            ? {
                "HTTP-Referer": process.env.OPENROUTER_SITE_URL
              }
            : {}),
          ...(process.env.OPENROUTER_APP_NAME
            ? {
                "X-Title": process.env.OPENROUTER_APP_NAME
              }
            : {})
        }
      })
    }
  }

  if (provider === "glm") {
    const apiKey = process.env.GLM_API_KEY || process.env.ZAI_API_KEY
    if (!apiKey) {
      return { provider: null, model: null, client: null }
    }

    return {
      provider,
      model: selection?.model || process.env.GLM_MODEL || process.env.ZAI_MODEL || "glm-4.5-air",
      client: new OpenAI({
        apiKey,
        baseURL: process.env.GLM_BASE_URL || process.env.ZAI_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/"
      })
    }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { provider: null, model: null, client: null }
  }

  return {
    provider: "openai",
    model: selection?.model || process.env.OPENAI_MODEL || "gpt-4.1-mini",
    client: new OpenAI({ apiKey })
  }
}

function summarizeComments(source: RedditPostData) {
  if (source.comments.length === 0) {
    return "Comment sample is limited, so the analysis relies on the post body and notes."
  }

  return source.comments
    .slice(0, 5)
    .map((comment, index) => `${index + 1}. ${comment.body}`)
    .join("\n")
}

function detectSignals(text: string) {
  const lower = text.toLowerCase()
  const toolSignal = /(tool|software|automation|dashboard|template|plugin|app|saas)/i.test(lower)
  const serviceSignal = /(agency|service|freelance|consultant|outsource|managed)/i.test(lower)
  const trendSignal = /(lately|recently|this year|2025|2026|trend|changing|shift|downturn|upward)/i.test(lower)
  const emotionSignal = /(frustrat|panic|stuck|angry|stress|hurt|confus|urgent|hate)/i.test(lower)
    ? "high"
    : /(concern|worry|hard|difficult|issue|problem)/i.test(lower)
      ? "medium"
      : "low"

  return { toolSignal, serviceSignal, trendSignal, emotionSignal }
}

function heuristicBusinessStage(text: string) {
  if (/(launch|new product|first order|start)/i.test(text)) return "Launch"
  if (/(scale|grow|growth|expand)/i.test(text)) return "Growth"
  if (/(ops|inventory|fulfillment|warehouse|supply)/i.test(text)) return "Operations"
  if (/(retention|repeat|customer|support)/i.test(text)) return "Retention"
  return "Discovery"
}

async function createJsonCompletion<T>(prompt: string, selection?: ProblemAnalysisLLMConfig): Promise<T | null> {
  const runtime = resolveLLMRuntime(selection)

  if (!runtime.client || !runtime.model) {
    return null
  }

  const response = await runtime.client.chat.completions.create({
    model: runtime.model,
    messages: [
      {
        role: "system",
        content: "Return valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: {
      type: "json_object"
    }
  })

  const output = response.choices[0]?.message?.content

  if (!output) {
    return null
  }

  return JSON.parse(output) as T
}

export const problemAnalysisEngineCapability: RadarCapabilityDefinition = {
  name: "problem_analysis_engine",
  purpose: "Generate structured problem analysis from normalized source material.",
  input_schema: {
    source: "reddit_post_data",
    notes: "string"
  },
  process_logic: [
    "summarize source body and comments",
    "detect problem signals",
    "generate structured analysis",
    "merge provider result with fallback analysis when available"
  ],
  output_schema: {
    "analysis.postSummary": "string",
    "analysis.commentThemes": "string",
    "analysis.sellerProblem": "string",
    "analysis.industrySignal": "string",
    "analysis.recordWorthy": "boolean",
    "analysis.reason": "string"
  },
  state: "idle|analyzing|ready|error",
  trigger: "called after source material is resolved",
  error_handling: {
    analysis_failed: "return fallback analysis",
    provider_unavailable: "return fallback analysis"
  }
}

export function buildFallbackAnalysis(source: RedditPostData, notes: string) {
  const combined = [source.title, source.selftext, source.comments.map((item) => item.body).join("\n"), notes]
    .filter(Boolean)
    .join("\n\n")
  const signals = detectSignals(combined)
  const commentThemes =
    source.comments.length > 0
      ? source.comments
          .slice(0, 3)
          .map((comment) => comment.body)
          .join("; ")
      : "Comment data is limited."

  return {
    postSummary: source.selftext || source.title,
    commentThemes,
    sellerProblem:
      source.selftext ||
      "Sellers are validating the same issue in public, which suggests a repeatable operating pain point rather than an isolated complaint.",
    industrySignal: signals.trendSignal
      ? "The comments already mention change, recency, or trends, which suggests the problem may be spreading."
      : "The discussion density suggests a persistent baseline pain point that is suitable for long-term radar tracking.",
    recordWorthy: Boolean(source.url || source.selftext || source.title) && (signals.toolSignal || signals.serviceSignal || combined.length > 120),
    reason: Boolean(source.url || source.selftext || source.title) && (signals.toolSignal || signals.serviceSignal || combined.length > 120)
      ? "The issue has clear business context and can extend into product opportunities or content angles."
      : "The signal is still light, so it would help to gather more comments or context before saving it.",
    marketSignals: signals,
    businessStage: heuristicBusinessStage(combined),
    combinedText: combined
  }
}

export async function runProblemAnalysis({
  source,
  notes,
  llm
}: {
  source: RedditPostData
  notes: string
  llm?: ProblemAnalysisLLMConfig
}): Promise<{
  analysis: Pick<AnalyzeResponse, "postSummary" | "commentThemes" | "sellerProblem" | "industrySignal" | "recordWorthy" | "reason">
  fallback: ReturnType<typeof buildFallbackAnalysis>
}> {
  const fallback = buildFallbackAnalysis(source, notes)

  const prompt = `
You are an analyst for a solo product called Problem Radar.
Return strict JSON with keys:
postSummary, commentThemes, sellerProblem, industrySignal, recordWorthy, reason.

Source URL: ${source.url}
Post title: ${source.title}
Subreddit: ${source.subreddit}
Post body:
${source.selftext || "(empty)"}

Top comments:
${summarizeComments(source)}

User notes:
${notes || "(empty)"}

Write concise business-ready English. Keep booleans as true/false.
`

  const completion = await createJsonCompletion<Pick<AnalyzeResponse, "postSummary" | "commentThemes" | "sellerProblem" | "industrySignal" | "recordWorthy" | "reason">>(prompt, llm).catch(() => null)

  return {
    analysis: completion ?? {
      postSummary: fallback.postSummary,
      commentThemes: fallback.commentThemes,
      sellerProblem: fallback.sellerProblem,
      industrySignal: fallback.industrySignal,
      recordWorthy: fallback.recordWorthy,
      reason: fallback.reason
    },
    fallback
  }
}


