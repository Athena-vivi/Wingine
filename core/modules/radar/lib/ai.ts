import { buildInsightDraft } from "../capabilities/insightDraftBuilder.ts"
import { runContentGeneration } from "../capabilities/contentGenerationEngine.ts"
import { runContentRewrite } from "../capabilities/contentRewriteEngine.ts"
import { runProblemAnalysis } from "../capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../capabilities/radarRecordBuilder.ts"
import type {
  AnalyzeResponse,
  GeneratedContent,
  RadarRecord,
  RedditPostData
} from "../types/radar.ts"

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


