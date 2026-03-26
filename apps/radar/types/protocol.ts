import type { BetObject, FlowRequest, ProblemObject, ScoreObject } from "../../../packages/shared"
import type { AnalyzeRequestBody, GeneratedContent, OutputBundle, RadarRecord, SourceMode } from "@/types/radar"

export type RadarCapabilityName =
  | "source_input_resolver"
  | "reddit_source_fetcher"
  | "manual_source_builder"
  | "source_material_normalizer"
  | "problem_analysis_engine"
  | "radar_record_builder"
  | "insight_draft_builder"
  | "radar_record_searcher"
  | "radar_record_mapper"
  | "radar_record_upsertor"
  | "content_generation_engine"
  | "content_rewrite_engine"
  | "output_bundle_manager"

export type RadarProtocolName =
  | "workspace_load"
  | "source_analyze"
  | "radar_save"
  | "content_generate"
  | "content_rewrite"
  | "problem_export"
  | "scoring_to_radar_feedback"
  | "betting_to_radar_feedback"

export type ProtocolCallerType = "human-ui" | "agent" | "api"

export type RadarProtocolContext = {
  workspace_id?: string
  source_url?: string
  platform?: string
}

export type RadarProtocolRequest<T = Record<string, unknown>> = {
  request_id: string
  capability: RadarCapabilityName | RadarProtocolName
  caller: {
    type: ProtocolCallerType
    id: string
  }
  payload: T
  context: RadarProtocolContext
}

export type RadarProtocolResponse<T = Record<string, unknown>> = {
  request_id: string
  capability: RadarCapabilityName | RadarProtocolName
  status: "success" | "error"
  state: "idle" | "loading" | "validating" | "analyzing" | "building" | "generating" | "rewriting" | "persisting" | "ready" | "error"
  data: T | null
  error: {
    code: string
    message: string
  } | null
}

export type SourceAnalyzePayload = AnalyzeRequestBody

export type RadarSavePayload = {
  radarRecord: RadarRecord
  generatedContent?: GeneratedContent | null
}

export type ContentGeneratePayload = {
  insight: string
  radarRecord?: RadarRecord
}

export type ContentRewritePayload = {
  instruction: string
  platform?: string
  generatedContent?: GeneratedContent
}

export type WorkspaceLoadPayload = {
  initialForm?: AnalyzeRequestBody
}

export type ProblemExportPayload = {
  radarRecord: RadarRecord
}

export type ScoringFeedbackPayload = {
  score: ScoreObject
}

export type BettingFeedbackPayload = {
  bet: BetObject
}

export type RadarWorkspaceState = {
  form: AnalyzeRequestBody
  sourceMode?: SourceMode
  radarRecord: RadarRecord | null
  generatedContent: GeneratedContent | null
  outputBundle: OutputBundle | null
}

export type ProblemExportResult = {
  contract_request: FlowRequest<ProblemObject>
}
