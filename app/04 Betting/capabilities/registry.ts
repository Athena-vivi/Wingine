import { allocationResolverCapability } from "@/capabilities/allocationResolver"
import { bettingHistoryManagerCapability } from "@/capabilities/bettingHistoryManager"
import { bettingInputResolverCapability } from "@/capabilities/bettingInputResolver"
import { candidatePoolLoaderCapability } from "@/capabilities/candidatePoolLoader"
import { decisionRecordManagerCapability } from "@/capabilities/decisionRecordManager"
import { decisionResolverCapability } from "@/capabilities/decisionResolver"
import { factorNormalizerCapability } from "@/capabilities/factorNormalizer"
import { scoringSignalAdapterCapability } from "@/capabilities/scoringSignalAdapter"

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
