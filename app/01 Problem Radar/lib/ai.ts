import { buildInsightDraft } from "@/capabilities/insightDraftBuilder"
import { runContentGeneration } from "@/capabilities/contentGenerationEngine"
import { runContentRewrite } from "@/capabilities/contentRewriteEngine"
import { runProblemAnalysis } from "@/capabilities/problemAnalysisEngine"
import { buildRadarRecord } from "@/capabilities/radarRecordBuilder"
import type {
  AnalyzeResponse,
  GeneratedContent,
  RadarRecord,
  RedditPostData
} from "@/types/radar"

export async function analyzeReddit(source: RedditPostData, notes: string): Promise<AnalyzeResponse> {
  const { analysis, fallback } = await runProblemAnalysis({ source, notes })
  const insightDraft = buildInsightDraft({
    source,
    businessStage: fallback.businessStage
  })
  const radar = buildRadarRecord({
    source,
    analysis,
    businessStage: fallback.businessStage,
    signals: fallback.marketSignals,
    insightDraft
  })

  return {
    ...analysis,
    insightDraft,
    radar,
    source
  }
}

export async function generateContent(insight: string, radar?: RadarRecord): Promise<GeneratedContent> {
  return runContentGeneration({
    insight,
    radarRecord: radar
  })
}

export async function rewriteContent(text: string, instruction: string, platform?: string) {
  return runContentRewrite({
    text,
    instruction,
    platform
  })
}
