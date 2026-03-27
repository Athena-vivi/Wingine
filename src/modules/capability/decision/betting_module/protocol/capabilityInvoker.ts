import { invokeAllocationResolver } from "../capabilities/allocationResolver.ts"
import { invokeBettingHistoryManager } from "../capabilities/bettingHistoryManager.ts"
import { invokeBettingInputResolver } from "../capabilities/bettingInputResolver.ts"
import { invokeCandidatePoolLoader } from "../capabilities/candidatePoolLoader.ts"
import { invokeDecisionRecordManager } from "../capabilities/decisionRecordManager.ts"
import { invokeDecisionResolver } from "../capabilities/decisionResolver.ts"
import { invokeFactorNormalizer } from "../capabilities/factorNormalizer.ts"
import { invokeScoringSignalAdapter } from "../capabilities/scoringSignalAdapter.ts"
import type { ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"

export function invokeCapability(request: ProtocolRequest): ProtocolResponse {
  switch (request.capability) {
    case "candidate_pool_loader":
      return invokeCandidatePoolLoader(request as Parameters<typeof invokeCandidatePoolLoader>[0])
    case "betting_input_resolver":
      return invokeBettingInputResolver(request as Parameters<typeof invokeBettingInputResolver>[0])
    case "scoring_signal_adapter":
      return invokeScoringSignalAdapter(request as Parameters<typeof invokeScoringSignalAdapter>[0])
    case "factor_normalizer":
      return invokeFactorNormalizer(request as Parameters<typeof invokeFactorNormalizer>[0])
    case "decision_resolver":
      return invokeDecisionResolver(request as Parameters<typeof invokeDecisionResolver>[0])
    case "allocation_resolver":
      return invokeAllocationResolver(request as Parameters<typeof invokeAllocationResolver>[0])
    case "decision_record_manager":
      return invokeDecisionRecordManager(request as Parameters<typeof invokeDecisionRecordManager>[0])
    case "betting_history_manager":
      return invokeBettingHistoryManager(request as Parameters<typeof invokeBettingHistoryManager>[0])
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



