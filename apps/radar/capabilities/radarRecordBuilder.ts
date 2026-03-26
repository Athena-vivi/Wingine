import type { RadarCapabilityDefinition, RadarRecord, RedditPostData } from "@/types/radar"

function heuristicProblemType(text: string) {
  if (/(ppc|ads|advertis)/i.test(text)) return "Marketing"
  if (/(inventory|stock|warehouse|fba|fulfillment|shipping)/i.test(text)) return "Operations"
  if (/(review|rating|listing|seo|keyword)/i.test(text)) return "Listing & Conversion"
  if (/(supplier|factory|qc|quality)/i.test(text)) return "Supply Chain"
  if (/(refund|return|support|customer)/i.test(text)) return "Customer Experience"
  return "General Seller Pain"
}

export const radarRecordBuilderCapability: RadarCapabilityDefinition = {
  name: "radar_record_builder",
  purpose: "Build normalized radar record fields from source and analysis state.",
  input_schema: {
    source: "reddit_post_data",
    analysis: "analysis_result",
    business_stage: "string",
    signals: "signal_block"
  },
  process_logic: [
    "extract raw problem text",
    "normalize core radar fields",
    "map analysis fields into radar record",
    "return normalized radar record"
  ],
  output_schema: {
    radar_record: "radar_record"
  },
  state: "idle|building|ready|error",
  trigger: "called after problem analysis completes",
  error_handling: {
    mapping_failed: "return partial radar record",
    invalid_analysis: "reject invocation"
  }
}

export function buildRadarRecord({
  source,
  analysis,
  businessStage,
  signals,
  insightDraft
}: {
  source: RedditPostData
  analysis: {
    reason: string
    recordWorthy: boolean
  }
  businessStage: string
  signals: {
    toolSignal: boolean
    serviceSignal: boolean
    trendSignal: boolean
    emotionSignal: string
  }
  insightDraft: string
}): RadarRecord {
  const rawProblem = source.selftext || source.title
  const normalizedProblem =
    rawProblem.length > 0
      ? rawProblem.slice(0, 180)
      : "Sellers are discussing a problem worth tracking, but the original post text is limited."

  return {
    source_type: source.url.startsWith("manual://") ? "manual" : "community",
    source_platform: source.url.startsWith("manual://") ? "manual" : "reddit",
    source_url: source.url,
    post_title: source.title,
    subreddit: source.subreddit,
    raw_problem: rawProblem,
    normalized_problem: normalizedProblem,
    problem_type: heuristicProblemType([source.title, source.selftext, source.comments.map((item) => item.body).join("\n")].filter(Boolean).join("\n\n")),
    business_stage: businessStage,
    emotion_signal: signals.emotionSignal,
    tool_signal: signals.toolSignal,
    service_signal: signals.serviceSignal,
    trend_signal: signals.trendSignal,
    record_worthy: analysis.recordWorthy,
    record_reason: analysis.reason,
    insight: insightDraft,
    product_opportunity: signals.toolSignal
      ? "There is room for a structured workflow tool that helps sellers detect and resolve this issue faster."
      : "There is room for a diagnostic service or consulting framework that helps sellers work through the issue systematically.",
    content_angle: "Start from one real seller problem and explain the structural change behind it."
  }
}
