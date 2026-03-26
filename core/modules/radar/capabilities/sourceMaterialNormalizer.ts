import { buildManualSource } from "./manualSourceBuilder.ts"
import { buildRedditDiagnosticsFromInput, fetchRedditSource } from "./redditSourceFetcher.ts"
import type { AnalyzeRequestBody, RadarCapabilityDefinition, RedditPostData, SourceMode } from "../types/radar.ts"

export const sourceMaterialNormalizerCapability: RadarCapabilityDefinition = {
  name: "source_material_normalizer",
  purpose: "Resolve final source material for downstream analysis.",
  input_schema: {
    source_mode: "reddit|manual",
    normalized_input: "analyze_request"
  },
  process_logic: [
    "route to reddit fetcher or manual builder",
    "fallback from reddit fetch to manual source when needed",
    "return normalized source package"
  ],
  output_schema: {
    source: "reddit_post_data",
    source_mode: "reddit|manual"
  },
  state: "idle|resolving|ready|error",
  trigger: "called after source input is resolved",
  error_handling: {
    source_resolution_failed: "fallback to manual source where possible"
  }
}

export async function resolveSourceMaterial({
  sourceMode,
  normalizedInput
}: {
  sourceMode: SourceMode
  normalizedInput: AnalyzeRequestBody
}): Promise<{
  source: RedditPostData
  sourceMode: SourceMode
}> {
  if (sourceMode === "reddit" && normalizedInput.redditUrl) {
    try {
      return {
        source: await fetchRedditSource(normalizedInput.redditUrl),
        sourceMode
      }
    } catch (error) {
      const source = buildManualSource(normalizedInput)

      source.diagnostics = {
        ...source.diagnostics,
        ...buildRedditDiagnosticsFromInput(
          normalizedInput.redditUrl,
          error instanceof Error ? error.message : String(error)
        )
      }

      return {
        source,
        sourceMode: "manual"
      }
    }
  }

  return {
    source: buildManualSource(normalizedInput),
    sourceMode: "manual"
  }
}


