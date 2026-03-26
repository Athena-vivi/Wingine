import type { ProblemObject, ProblemStatus } from "../../shared/index.ts"
import type { RadarRecord } from "../types/radar.ts"

function resolveProblemStatus(record: RadarRecord): ProblemStatus {
  if (record.problem_status) {
    return record.problem_status
  }

  if (record.record_worthy) {
    return "structured"
  }

  return "qualified"
}

function buildMetadata(record: RadarRecord): ProblemObject["metadata"] {
  const tags = [record.problem_type, record.business_stage, record.source_platform]
    .filter(Boolean)
    .map((value) => value.toLowerCase().replace(/\s+/g, "-"))

  const labels = [record.emotion_signal].filter(Boolean)

  return {
    tags,
    labels,
    custom: {
      source_platform: record.source_platform,
      problem_type: record.problem_type,
      business_stage: record.business_stage,
      emotion_signal: record.emotion_signal,
      trend_signal: record.trend_signal,
      tool_signal: record.tool_signal,
      service_signal: record.service_signal,
      record_reason: record.record_reason
    }
  }
}

export function exportProblemObjectFromRadarRecord(
  record: RadarRecord,
  overrides?: { status?: ProblemStatus }
): ProblemObject {
  const timestamp = new Date().toISOString()
  const nextRecord = overrides?.status
    ? {
        ...record,
        problem_status: overrides.status
      }
    : record

  return {
    id: `problem_${nextRecord.source_url}`,
    type: "problem",
    source: {
      system: "radar",
      origin_id: nextRecord.source_url,
      origin_ref: nextRecord.source_url
    },
    status: resolveProblemStatus(nextRecord),
    metadata: buildMetadata(nextRecord),
    timestamps: {
      created_at: timestamp,
      updated_at: timestamp,
      observed_at: timestamp
    },
    title: nextRecord.post_title || nextRecord.normalized_problem,
    summary: nextRecord.record_reason || nextRecord.normalized_problem,
    description: nextRecord.raw_problem,
    normalized_problem: nextRecord.normalized_problem,
    record_worthy: nextRecord.record_worthy
  }
}


