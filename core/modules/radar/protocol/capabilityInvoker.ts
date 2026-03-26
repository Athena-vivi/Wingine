import { runContentGeneration } from "../capabilities/contentGenerationEngine.ts"
import { runContentRewrite } from "../capabilities/contentRewriteEngine.ts"
import { buildInsightDraft } from "../capabilities/insightDraftBuilder.ts"
import { buildManualSource } from "../capabilities/manualSourceBuilder.ts"
import { buildOutputBundle } from "../capabilities/outputBundleManager.ts"
import { runProblemAnalysis } from "../capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../capabilities/radarRecordBuilder.ts"
import { mapRadarRecordToFields } from "../capabilities/radarRecordMapper.ts"
import { searchRadarRecord } from "../capabilities/radarRecordSearcher.ts"
import { upsertRadarRecordCapability } from "../capabilities/radarRecordUpsertor.ts"
import { fetchRedditSource } from "../capabilities/redditSourceFetcher.ts"
import { resolveSourceInput } from "../capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../capabilities/sourceMaterialNormalizer.ts"
import type { RadarCapabilityName, RadarProtocolRequest, RadarProtocolResponse } from "../types/protocol.ts"

export async function invokeRadarCapability(
  request: RadarProtocolRequest
): Promise<RadarProtocolResponse<Record<string, unknown>>> {
  try {
    switch (request.capability as RadarCapabilityName) {
      case "source_input_resolver":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: resolveSourceInput(request.payload as never),
          error: null
        }
      case "reddit_source_fetcher":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            source: await fetchRedditSource((request.payload as { redditUrl: string }).redditUrl)
          },
          error: null
        }
      case "manual_source_builder":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            source: buildManualSource(request.payload as never)
          },
          error: null
        }
      case "source_material_normalizer":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: await resolveSourceMaterial(request.payload as never),
          error: null
        }
      case "problem_analysis_engine":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: await runProblemAnalysis(request.payload as never),
          error: null
        }
      case "radar_record_builder":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            radar: buildRadarRecord(request.payload as never)
          },
          error: null
        }
      case "insight_draft_builder":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            insightDraft: buildInsightDraft(request.payload as never)
          },
          error: null
        }
      case "radar_record_searcher":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            existingRecord: await searchRadarRecord((request.payload as { sourceUrl: string }).sourceUrl)
          },
          error: null
        }
      case "radar_record_mapper":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            fields: mapRadarRecordToFields((request.payload as { radarRecord: never }).radarRecord)
          },
          error: null
        }
      case "radar_record_upsertor":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            saveResult: await upsertRadarRecordCapability((request.payload as { radarRecord: never }).radarRecord)
          },
          error: null
        }
      case "content_generation_engine":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            generatedContent: await runContentGeneration(request.payload as never)
          },
          error: null
        }
      case "content_rewrite_engine":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            result: await runContentRewrite(request.payload as never)
          },
          error: null
        }
      case "output_bundle_manager":
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            outputBundle: buildOutputBundle(request.payload as never)
          },
          error: null
        }
      default:
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "error",
          state: "error",
          data: null,
          error: {
            code: "capability_not_found",
            message: `Unknown capability: ${request.capability}`
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
        code: "capability_invocation_failed",
        message: error instanceof Error ? error.message : "Radar capability invocation failed."
      }
    }
  }
}


