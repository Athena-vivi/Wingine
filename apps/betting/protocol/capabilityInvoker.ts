import { invokeAllocationResolver } from "@/capabilities/allocationResolver"
import { invokeBettingHistoryManager } from "@/capabilities/bettingHistoryManager"
import { invokeBettingInputResolver } from "@/capabilities/bettingInputResolver"
import { invokeCandidatePoolLoader } from "@/capabilities/candidatePoolLoader"
import { invokeDecisionRecordManager } from "@/capabilities/decisionRecordManager"
import { invokeDecisionResolver } from "@/capabilities/decisionResolver"
import { invokeFactorNormalizer } from "@/capabilities/factorNormalizer"
import { invokeScoringSignalAdapter } from "@/capabilities/scoringSignalAdapter"
import type { ProtocolRequest, ProtocolResponse } from "@/types/protocol"

export function invokeCapability(request: ProtocolRequest): ProtocolResponse {
  switch (request.capability) {
    case "candidate_pool_loader":
      return invokeCandidatePoolLoader(request)
    case "betting_input_resolver":
      return invokeBettingInputResolver(request)
    case "scoring_signal_adapter":
      return invokeScoringSignalAdapter(request)
    case "factor_normalizer":
      return invokeFactorNormalizer(request)
    case "decision_resolver":
      return invokeDecisionResolver(request)
    case "allocation_resolver":
      return invokeAllocationResolver(request)
    case "decision_record_manager":
      return invokeDecisionRecordManager(request)
    case "betting_history_manager":
      return invokeBettingHistoryManager(request)
    default:
      return {
        request_id: request.request_id,
        capability: request.capability,
        status: "error",
        state: "error",
        data: null,
        error: {
          code: "capability_not_found",
          message: "capability is not registered"
        }
      }
  }
}
