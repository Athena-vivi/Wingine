import { contentGenerationEngineCapability } from "@/capabilities/contentGenerationEngine"
import { contentRewriteEngineCapability } from "@/capabilities/contentRewriteEngine"
import { insightDraftBuilderCapability } from "@/capabilities/insightDraftBuilder"
import { manualSourceBuilderCapability } from "@/capabilities/manualSourceBuilder"
import { outputBundleManagerCapability } from "@/capabilities/outputBundleManager"
import { problemAnalysisEngineCapability } from "@/capabilities/problemAnalysisEngine"
import { radarRecordBuilderCapability } from "@/capabilities/radarRecordBuilder"
import { radarRecordMapperCapability } from "@/capabilities/radarRecordMapper"
import { radarRecordSearcherCapability } from "@/capabilities/radarRecordSearcher"
import { radarRecordUpsertorCapability } from "@/capabilities/radarRecordUpsertor"
import { redditSourceFetcherCapability } from "@/capabilities/redditSourceFetcher"
import { sourceInputResolverCapability } from "@/capabilities/sourceInputResolver"
import { sourceMaterialNormalizerCapability } from "@/capabilities/sourceMaterialNormalizer"

export const radarCapabilityRegistry = [
  sourceInputResolverCapability,
  redditSourceFetcherCapability,
  manualSourceBuilderCapability,
  sourceMaterialNormalizerCapability,
  problemAnalysisEngineCapability,
  radarRecordBuilderCapability,
  insightDraftBuilderCapability,
  radarRecordSearcherCapability,
  radarRecordMapperCapability,
  radarRecordUpsertorCapability,
  contentGenerationEngineCapability,
  contentRewriteEngineCapability,
  outputBundleManagerCapability
]
