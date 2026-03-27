import { allocationResolverCapability } from "./allocationResolver.ts"
import { bettingHistoryManagerCapability } from "./bettingHistoryManager.ts"
import { bettingInputResolverCapability } from "./bettingInputResolver.ts"
import { candidatePoolLoaderCapability } from "./candidatePoolLoader.ts"
import { decisionRecordManagerCapability } from "./decisionRecordManager.ts"
import { decisionResolverCapability } from "./decisionResolver.ts"
import { factorNormalizerCapability } from "./factorNormalizer.ts"
import { scoringSignalAdapterCapability } from "./scoringSignalAdapter.ts"

export const bettingCapabilityRegistry = [
  candidatePoolLoaderCapability,
  scoringSignalAdapterCapability,
  bettingInputResolverCapability,
  factorNormalizerCapability,
  decisionResolverCapability,
  allocationResolverCapability,
  decisionRecordManagerCapability,
  bettingHistoryManagerCapability
]


