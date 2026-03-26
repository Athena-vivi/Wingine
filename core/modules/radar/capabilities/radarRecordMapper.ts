import type { RadarCapabilityDefinition, RadarRecord } from "../types/radar.ts"

export const radarRecordMapperCapability: RadarCapabilityDefinition = {
  name: "radar_record_mapper",
  purpose: "Map radar record into storage-ready fields.",
  input_schema: {
    radar_record: "radar_record"
  },
  process_logic: [
    "normalize date field",
    "map radar record into storage fields",
    "return storage payload"
  ],
  output_schema: {
    fields: "record<string, unknown>"
  },
  state: "idle|mapping|ready|error",
  trigger: "called before create or update",
  error_handling: {
    invalid_record: "throw validation error",
    mapping_failed: "return partial field map"
  }
}

export function mapRadarRecordToFields(record: RadarRecord) {
  return {
    date: new Date().toISOString().slice(0, 10),
    source_type: record.source_type,
    source_platform: record.source_platform,
    source_url: record.source_url,
    post_title: record.post_title,
    subreddit: record.subreddit,
    raw_problem: record.raw_problem,
    normalized_problem: record.normalized_problem,
    problem_type: record.problem_type,
    business_stage: record.business_stage,
    emotion_signal: record.emotion_signal,
    tool_signal: record.tool_signal,
    service_signal: record.service_signal,
    trend_signal: record.trend_signal,
    record_worthy: record.record_worthy,
    record_reason: record.record_reason,
    insight: record.insight,
    product_opportunity: record.product_opportunity,
    content_angle: record.content_angle,
    twitter_draft: record.twitter_draft || "",
    xiaohongshu_draft: record.xiaohongshu_draft || "",
    wechat_draft: record.wechat_draft || "",
    substack_draft: record.substack_draft || ""
  }
}


