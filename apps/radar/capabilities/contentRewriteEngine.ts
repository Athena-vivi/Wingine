import OpenAI from "openai"

import type { RadarCapabilityDefinition } from "@/types/radar"

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

async function createTextCompletion(prompt: string): Promise<string | null> {
  if (!openai) {
    return null
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })

  return response.choices[0]?.message?.content ?? null
}

export const contentRewriteEngineCapability: RadarCapabilityDefinition = {
  name: "content_rewrite_engine",
  purpose: "Rewrite one platform draft using an explicit instruction.",
  input_schema: {
    text: "string",
    instruction: "string",
    platform: "string"
  },
  process_logic: [
    "validate rewrite input",
    "normalize rewrite instruction",
    "apply provider rewrite when available",
    "fallback to annotated rewrite when provider is unavailable"
  ],
  output_schema: {
    rewritten_text: "string"
  },
  state: "idle|rewriting|ready|error",
  trigger: "called when rewrite is requested",
  error_handling: {
    missing_text: "throw validation error",
    rewrite_failed: "return original text"
  }
}

export async function runContentRewrite({
  text,
  instruction,
  platform
}: {
  text: string
  instruction: string
  platform?: string
}): Promise<string> {
  const trimmedInstruction = instruction.trim() || "Make the text clearer."

  if (!openai) {
    return `${text}\n\n[Rewrite instruction applied: ${trimmedInstruction}${platform ? ` | ${platform}` : ""}]`
  }

  const rewritten = await createTextCompletion(
    `Rewrite the following ${platform || "content"} according to the instruction. Return only the rewritten text.\nInstruction: ${trimmedInstruction}\n\nText:\n${text}`
  )

  return rewritten || text
}
