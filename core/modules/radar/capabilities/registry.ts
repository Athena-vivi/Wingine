import { contentGenerationEngineCapability } from "./contentGenerationEngine.ts"
import { contentRewriteEngineCapability } from "./contentRewriteEngine.ts"
import { insightDraftBuilderCapability } from "./insightDraftBuilder.ts"
import { manualSourceBuilderCapability } from "./manualSourceBuilder.ts"
import { outputBundleManagerCapability } from "./outputBundleManager.ts"
import { problemAnalysisEngineCapability } from "./problemAnalysisEngine.ts"
import { radarRecordBuilderCapability } from "./radarRecordBuilder.ts"
import { radarRecordMapperCapability } from "./radarRecordMapper.ts"
import { radarRecordSearcherCapability } from "./radarRecordSearcher.ts"
import { radarRecordUpsertorCapability } from "./radarRecordUpsertor.ts"
import { redditSourceFetcherCapability } from "./redditSourceFetcher.ts"
import { sourceInputResolverCapability } from "./sourceInputResolver.ts"
import { sourceMaterialNormalizerCapability } from "./sourceMaterialNormalizer.ts"

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


