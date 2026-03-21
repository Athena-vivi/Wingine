import { buildInsightDraft } from "@/capabilities/insightDraftBuilder"
import { buildOutputBundle } from "@/capabilities/outputBundleManager"
import { runProblemAnalysis } from "@/capabilities/problemAnalysisEngine"
import { buildRadarRecord } from "@/capabilities/radarRecordBuilder"
import { upsertRadarRecordCapability } from "@/capabilities/radarRecordUpsertor"
import { resolveSourceInput } from "@/capabilities/sourceInputResolver"
import { resolveSourceMaterial } from "@/capabilities/sourceMaterialNormalizer"
import { importBetFeedbackToRadar } from "@/adapters/betFeedbackImportAdapter"
import { exportProblemObjectFromRadarRecord } from "@/adapters/problemExportAdapter"
import { runContentGeneration } from "@/capabilities/contentGenerationEngine"
import { runContentRewrite } from "@/capabilities/contentRewriteEngine"
import { importScoreFeedbackToRadar } from "@/adapters/scoreFeedbackImportAdapter"
import { buildRadarToBuilderRequest } from "@/contracts/radarToBuilder"
import {
  applyBetFeedbackToRadarState,
  applyScoringFeedbackToRadarState,
  getRadarRuntimeState
} from "@/protocol/radarStateStore"
import type {
  ContentGeneratePayload,
  ContentRewritePayload,
  BettingFeedbackPayload,
  ProblemExportPayload,
  RadarProtocolRequest,
  RadarProtocolResponse,
  RadarSavePayload,
  ScoringFeedbackPayload,
  SourceAnalyzePayload,
  WorkspaceLoadPayload
} from "@/types/protocol"

const initialForm = {
  redditUrl: "",
  postText: "",
  comments: "",
  notes: ""
}

export async function runRadarProtocol(
  request: RadarProtocolRequest
): Promise<RadarProtocolResponse<Record<string, unknown>>> {
  try {
    switch (request.capability) {
      case "workspace_load": {
        const payload = request.payload as WorkspaceLoadPayload
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            workspace_state: {
              form: payload.initialForm ?? initialForm,
              sourceMode: undefined,
              radarRecord: null,
              generatedContent: null,
              outputBundle: buildOutputBundle({
                radarRecord: null,
                generatedContent: null,
                saveResult: null
              })
            }
          },
          error: null
        }
      }
      case "source_analyze": {
        const payload = request.payload as SourceAnalyzePayload
        const { sourceMode, normalizedInput } = resolveSourceInput(payload)
        const { source, sourceMode: resolvedSourceMode } = await resolveSourceMaterial({
          sourceMode,
          normalizedInput
        })
        const { analysis, fallback } = await runProblemAnalysis({
          source,
          notes: normalizedInput.notes || ""
        })
        const insightDraft = buildInsightDraft({
          source,
          businessStage: fallback.businessStage
        })
        const radarRecord = buildRadarRecord({
          source,
          analysis,
          businessStage: fallback.businessStage,
          signals: fallback.marketSignals,
          insightDraft
        })
        const normalizedRadar = {
          ...radarRecord,
          source_type: resolvedSourceMode === "reddit" ? "community" : "manual",
          source_platform: resolvedSourceMode === "reddit" ? "reddit" : "manual"
        }

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            source,
            analysis: {
              ...analysis,
              insightDraft,
              radar: normalizedRadar,
              source
            },
            sourceMode: resolvedSourceMode,
            outputBundle: buildOutputBundle({
              radarRecord: normalizedRadar,
              generatedContent: null,
              saveResult: null
            })
          },
          error: null
        }
      }
      case "radar_save": {
        const payload = request.payload as RadarSavePayload
        const mergedRadarRecord = payload.generatedContent
          ? {
              ...payload.radarRecord,
              twitter_draft: payload.generatedContent.twitter,
              xiaohongshu_draft: payload.generatedContent.xiaohongshu,
              wechat_draft: payload.generatedContent.wechat,
              substack_draft: payload.generatedContent.substack
            }
          : payload.radarRecord

        const saveResult = await upsertRadarRecordCapability(mergedRadarRecord)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            saveResult,
            outputBundle: buildOutputBundle({
              radarRecord: mergedRadarRecord,
              generatedContent: null,
              saveResult
            })
          },
          error: null
        }
      }
      case "content_generate": {
        const payload = request.payload as ContentGeneratePayload
        const generatedContent = await runContentGeneration({
          insight: payload.insight,
          radarRecord: payload.radarRecord
        })

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            generatedContent,
            outputBundle: buildOutputBundle({
              radarRecord: payload.radarRecord ?? null,
              generatedContent,
              saveResult: null
            })
          },
          error: null
        }
      }
      case "content_rewrite": {
        const payload = request.payload as ContentRewritePayload
        const sourceText =
          payload.platform === "Twitter"
            ? payload.generatedContent?.twitter
            : payload.platform === "Xiaohongshu"
              ? payload.generatedContent?.xiaohongshu
              : payload.platform === "WeChat"
                ? payload.generatedContent?.wechat
                : payload.generatedContent?.substack

        if (!sourceText) {
          throw new Error("Rewrite source text is required.")
        }

        const result = await runContentRewrite({
          text: sourceText,
          instruction: payload.instruction,
          platform: payload.platform
        })

        let generatedContent = payload.generatedContent ?? null

        if (generatedContent && payload.platform) {
          if (payload.platform === "Twitter") {
            generatedContent = { ...generatedContent, twitter: result }
          } else if (payload.platform === "Xiaohongshu") {
            generatedContent = { ...generatedContent, xiaohongshu: result }
          } else if (payload.platform === "WeChat") {
            generatedContent = { ...generatedContent, wechat: result }
          } else if (payload.platform === "Substack") {
            generatedContent = { ...generatedContent, substack: result }
          }
        }

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            result,
            generatedContent,
            outputBundle: buildOutputBundle({
              radarRecord: null,
              generatedContent,
              saveResult: null
            })
          },
          error: null
        }
      }
      case "problem_export": {
        const payload = request.payload as ProblemExportPayload
        const runtimeState = await getRadarRuntimeState()
        const problemId = `problem_${payload.radarRecord.source_url}`
        const exportedProblem = exportProblemObjectFromRadarRecord(payload.radarRecord, {
          status: runtimeState.problem_statuses[problemId]
        })

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            contract_request: {
              ...buildRadarToBuilderRequest(payload.radarRecord),
              object: exportedProblem
            }
          },
          error: null
        }
      }
      case "scoring_to_radar_feedback": {
        const payload = request.payload as ScoringFeedbackPayload
        const feedback = importScoreFeedbackToRadar(payload.score)
        const applied = await applyScoringFeedbackToRadarState(feedback)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            feedback,
            applied_state: applied
          },
          error: null
        }
      }
      case "betting_to_radar_feedback": {
        const payload = request.payload as BettingFeedbackPayload
        const feedback = importBetFeedbackToRadar(payload.bet)
        const applied = await applyBetFeedbackToRadarState(feedback)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            feedback,
            applied_state: applied
          },
          error: null
        }
      }
      default:
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "error",
          state: "error",
          data: null,
          error: {
            code: "protocol_not_found",
            message: `Unknown radar protocol: ${request.capability}`
          }
        }
    }
  } catch (error) {
    return {
      request_id: request.request_id,
      capability: request.capability,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "protocol_invocation_failed",
        message: error instanceof Error ? error.message : "Radar protocol invocation failed."
      }
    }
  }
}
