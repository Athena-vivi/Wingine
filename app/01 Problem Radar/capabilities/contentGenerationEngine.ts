import OpenAI from "openai"

import type { GeneratedContent, RadarCapabilityDefinition, RadarRecord } from "@/types/radar"

const aiProvider = process.env.OPENROUTER_API_KEY
  ? "openrouter"
  : process.env.OPENAI_API_KEY
    ? "openai"
    : null

const openai =
  aiProvider === "openrouter"
    ? new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
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
    : aiProvider === "openai"
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null

const model =
  aiProvider === "openrouter"
    ? process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini"
    : process.env.OPENAI_MODEL || "gpt-4.1-mini"

async function createJsonCompletion<T>(prompt: string): Promise<T | null> {
  if (!openai) {
    return null
  }

  const response = await openai.chat.completions.create({
    model,
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

export const contentGenerationEngineCapability: RadarCapabilityDefinition = {
  name: "content_generation_engine",
  purpose: "Generate four platform-specific drafts from insight and radar context.",
  input_schema: {
    insight: "string",
    radar_record: "radar_record"
  },
  process_logic: [
    "validate insight input",
    "build fallback draft bundle",
    "generate provider draft bundle when available",
    "merge provider output with fallback output"
  ],
  output_schema: {
    generated_content: "generated_content"
  },
  state: "idle|generating|ready|error",
  trigger: "called when content generation is requested",
  error_handling: {
    missing_insight: "throw validation error",
    generation_failed: "return fallback content"
  }
}

export function buildContentFallback(insight: string, radar?: RadarRecord): GeneratedContent {
  const core = radar?.normalized_problem || "Seller pain is shifting from isolated complaints to a trackable structural signal."
  const angle = radar?.content_angle || "Use a concrete case to unpack the industry shift."

  return {
    twitter: `Hook\nA source thread just exposed a seller pain point hiding in plain sight.\n\nObservation\n${core}\n\nInsight\n${angle}\n${insight}`,
    xiaohongshu: `Title: One source thread exposed a seller problem many people are quietly dealing with\n\nStory: I saw a seller asking for help, and at first it looked like a one-off complaint. Then the comments showed many people repeating the same frustration.\n\nObservation: ${core}\n\nJudgment: ${angle}\n${insight}`,
    wechat: `One seller's problem is rarely just one seller's problem.\n\nA recent source discussion revealed a very typical tension: ${core}\n\nWhen similar signals keep appearing, the issue is usually not just execution detail. It points to a market shift.\n\nMy take: ${angle}\n\n${insight}`,
    substack: `Problem\n${core}\n\nBackground\nA recent discussion surfaced repeated seller friction across the same workflow.\n\nChange\nWhat looks like a complaint is often an early indicator of market shift.\n\nMechanism\n${angle}\n\nInsight\n${insight}`
  }
}

export async function runContentGeneration({
  insight,
  radarRecord
}: {
  insight: string
  radarRecord?: RadarRecord
}): Promise<GeneratedContent> {
  const fallback = buildContentFallback(insight, radarRecord)

  const prompt = `
You generate four platform-specific drafts in strict JSON with keys:
twitter, xiaohongshu, wechat, substack.

Context insight:
${insight}

Radar record:
${JSON.stringify(radarRecord ?? {}, null, 2)}

Rules:
- Twitter: Hook / Observation / Insight, short paragraphs.
- Xiaohongshu: title, story, observation, judgment. Conversational and narrative.
- WeChat: story, problem, industry change, explanation.
- Substack: problem, background, change, mechanism. Clear article structure.
`

  const completion = await createJsonCompletion<GeneratedContent>(prompt).catch(() => null)
  return completion ? { ...fallback, ...completion } : fallback
}
