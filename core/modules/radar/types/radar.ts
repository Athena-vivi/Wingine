export interface RadarRecord {
  source_type: string
  source_platform: string
  source_url: string
  post_title: string
  subreddit?: string
  raw_problem: string
  normalized_problem: string
  problem_type: string
  business_stage: string
  emotion_signal: string
  tool_signal: boolean
  service_signal: boolean
  trend_signal: boolean
  record_worthy: boolean
  record_reason: string
  problem_status?: "captured" | "qualified" | "structured" | "linked" | "archived"
  insight: string
  product_opportunity: string
  content_angle: string
  twitter_draft?: string
  xiaohongshu_draft?: string
  wechat_draft?: string
  substack_draft?: string
}

export interface RedditComment {
  author: string
  score: number
  body: string
}

export interface RedditPostData {
  url: string
  title: string
  selftext: string
  subreddit: string
  score: number
  comments: RedditComment[]
}

export interface AnalyzeRequestBody {
  redditUrl?: string
  postText?: string
  comments?: string
  notes?: string
}

export interface AnalyzeResponse {
  postSummary: string
  commentThemes: string
  sellerProblem: string
  industrySignal: string
  recordWorthy: boolean
  reason: string
  insightDraft: string
  radar: RadarRecord
  source: RedditPostData
}

export interface GenerateRequestBody {
  insight: string
  radarRecord?: RadarRecord
}

export interface GeneratedContent {
  twitter: string
  xiaohongshu: string
  wechat: string
  substack: string
}

export interface OutputBundle {
  radarRecord: RadarRecord | null
  generatedContent: GeneratedContent | null
  saveResult: RadarSaveResult | null
}

export interface RewriteRequestBody {
  text: string
  instruction: string
  platform?: string
}

export interface RadarSaveResult {
  ok: boolean
  mode: "mock" | "feishu"
  action: "created" | "updated"
  recordId: string
}

export type SourceMode = "reddit" | "manual"

export interface RadarCapabilityDefinition {
  name: string
  purpose: string
  input_schema: Record<string, string>
  process_logic: string[]
  output_schema: Record<string, string>
  state: string
  trigger: string
  error_handling: Record<string, string>
}
