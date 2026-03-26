import type { RadarCapabilityDefinition, RedditPostData } from "../types/radar.ts"

export const insightDraftBuilderCapability: RadarCapabilityDefinition = {
  name: "insight_draft_builder",
  purpose: "Build the reusable insight draft used by downstream content generation.",
  input_schema: {
    source: "reddit_post_data",
    business_stage: "string"
  },
  process_logic: [
    "extract repeatable market insight",
    "normalize reusable insight draft",
    "return structured insight text"
  ],
  output_schema: {
    insight_draft: "string"
  },
  state: "idle|building|ready|error",
  trigger: "called after problem analysis and before radar record finalize",
  error_handling: {
    insight_failed: "return fallback insight"
  }
}

export function buildInsightDraft({
  source,
  businessStage
}: {
  source: RedditPostData
  businessStage: string
}): string {
  return `Sellers are not only complaining about a single issue. They are exposing systemic friction in the ${businessStage} stage. If similar threads keep appearing, this should become a reusable problem profile and content theme.`
}


