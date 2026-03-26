import type { AnalyzeRequestBody, RadarCapabilityDefinition, SourceMode } from "../types/radar.ts"

export const sourceInputResolverCapability: RadarCapabilityDefinition = {
  name: "source_input_resolver",
  purpose: "Validate and normalize incoming source material for downstream analysis.",
  input_schema: {
    reddit_url: "string",
    post_text: "string",
    comments: "string",
    notes: "string"
  },
  process_logic: [
    "validate that at least one source field is present",
    "trim and normalize input fields",
    "resolve source mode as reddit or manual",
    "return normalized intake payload"
  ],
  output_schema: {
    source_mode: "reddit|manual",
    normalized_input: "analyze_request"
  },
  state: "idle|validating|ready|error",
  trigger: "called when analysis is requested",
  error_handling: {
    missing_source: "throw validation error when reddit url and post text are both empty",
    invalid_payload: "fallback to empty normalized fields"
  }
}

export function resolveSourceInput(input: AnalyzeRequestBody): {
  sourceMode: SourceMode
  normalizedInput: AnalyzeRequestBody
} {
  const normalizedInput: AnalyzeRequestBody = {
    redditUrl: input.redditUrl?.trim() ?? "",
    postText: input.postText?.trim() ?? "",
    comments: input.comments?.trim() ?? "",
    notes: input.notes?.trim() ?? ""
  }

  if (!normalizedInput.redditUrl && !normalizedInput.postText) {
    throw new Error("Please provide a Reddit URL or paste the Reddit post text.")
  }

  return {
    sourceMode: normalizedInput.redditUrl ? "reddit" : "manual",
    normalizedInput
  }
}


