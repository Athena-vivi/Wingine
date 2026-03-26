import { confidenceResolverCapability } from "@/capabilities/confidenceResolver"
import { dimensionScoreManagerCapability } from "@/capabilities/dimensionScoreManager"
import { evaluationHistoryManagerCapability } from "@/capabilities/evaluationHistoryManager"
import { evaluationRecordManagerCapability } from "@/capabilities/evaluationRecordManager"
import { gateResolverCapability } from "@/capabilities/gateResolver"
import { objectContextLoaderCapability } from "@/capabilities/objectContextLoader"
import { roleInputManagerCapability } from "@/capabilities/roleInputManager"
import { scoreAggregatorCapability } from "@/capabilities/scoreAggregator"
import { typeProfileResolverCapability } from "@/capabilities/typeProfileResolver"

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
