import { invokeConfidenceResolver } from "@/capabilities/confidenceResolver"
import { invokeDimensionScoreManager } from "@/capabilities/dimensionScoreManager"
import { invokeEvaluationHistoryManager } from "@/capabilities/evaluationHistoryManager"
import { invokeEvaluationRecordManager } from "@/capabilities/evaluationRecordManager"
import { invokeGateResolver } from "@/capabilities/gateResolver"
import { invokeObjectContextLoader } from "@/capabilities/objectContextLoader"
import { invokeRoleInputManager } from "@/capabilities/roleInputManager"
import { invokeScoreAggregator } from "@/capabilities/scoreAggregator"
import { invokeTypeProfileResolver } from "@/capabilities/typeProfileResolver"
import type { ProtocolRequest, ProtocolResponse } from "@/types/protocol"

export function invokeCapability(request: ProtocolRequest): ProtocolResponse {
  switch (request.capability) {
    case "object_context_loader":
      return invokeObjectContextLoader(request)
    case "type_profile_resolver":
      return invokeTypeProfileResolver(request)
    case "dimension_score_manager":
      return invokeDimensionScoreManager(request)
    case "score_aggregator":
      return invokeScoreAggregator(request)
    case "confidence_resolver":
      return invokeConfidenceResolver(request)
    case "gate_resolver":
      return invokeGateResolver(request)
    case "role_input_manager":
      return invokeRoleInputManager(request)
    case "evaluation_record_manager":
      return invokeEvaluationRecordManager(request)
    case "evaluation_history_manager":
      return invokeEvaluationHistoryManager(request)
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
