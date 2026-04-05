import { confidenceResolverCapability } from "./confidenceResolver.ts"
import { dimensionScoreManagerCapability } from "./dimensionScoreManager.ts"
import { evaluationHistoryManagerCapability } from "./evaluationHistoryManager.ts"
import { evaluationRecordManagerCapability } from "./evaluationRecordManager.ts"
import { gateResolverCapability } from "./gateResolver.ts"
import { objectContextLoaderCapability } from "./objectContextLoader.ts"
import { roleInputManagerCapability } from "./roleInputManager.ts"
import { scoreAggregatorCapability } from "./scoreAggregator.ts"
import { typeProfileResolverCapability } from "./typeProfileResolver.ts"

export const scoringCapabilityRegistry = [
  objectContextLoaderCapability,
  typeProfileResolverCapability,
  dimensionScoreManagerCapability,
  scoreAggregatorCapability,
  confidenceResolverCapability,
  gateResolverCapability,
  roleInputManagerCapability,
  evaluationRecordManagerCapability,
  evaluationHistoryManagerCapability
]


