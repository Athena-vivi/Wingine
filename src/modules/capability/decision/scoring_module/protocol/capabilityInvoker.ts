import { invokeConfidenceResolver } from "../capabilities/confidenceResolver.ts"
import { invokeDimensionScoreManager } from "../capabilities/dimensionScoreManager.ts"
import { invokeEvaluationHistoryManager } from "../capabilities/evaluationHistoryManager.ts"
import { invokeEvaluationRecordManager } from "../capabilities/evaluationRecordManager.ts"
import { invokeGateResolver } from "../capabilities/gateResolver.ts"
import { invokeObjectContextLoader } from "../capabilities/objectContextLoader.ts"
import { invokeRoleInputManager } from "../capabilities/roleInputManager.ts"
import { invokeScoreAggregator } from "../capabilities/scoreAggregator.ts"
import { invokeTypeProfileResolver } from "../capabilities/typeProfileResolver.ts"
import type { ProtocolRequest, ProtocolResponse } from "../types/protocol.ts"

export function invokeCapability(request: ProtocolRequest): ProtocolResponse {
  switch (request.capability) {
    case "object_context_loader":
      return invokeObjectContextLoader(request as Parameters<typeof invokeObjectContextLoader>[0])
    case "type_profile_resolver":
      return invokeTypeProfileResolver(request as Parameters<typeof invokeTypeProfileResolver>[0])
    case "dimension_score_manager":
      return invokeDimensionScoreManager(request as Parameters<typeof invokeDimensionScoreManager>[0])
    case "score_aggregator":
      return invokeScoreAggregator(request as Parameters<typeof invokeScoreAggregator>[0])
    case "confidence_resolver":
      return invokeConfidenceResolver(request as Parameters<typeof invokeConfidenceResolver>[0])
    case "gate_resolver":
      return invokeGateResolver(request as Parameters<typeof invokeGateResolver>[0])
    case "role_input_manager":
      return invokeRoleInputManager(request as Parameters<typeof invokeRoleInputManager>[0])
    case "evaluation_record_manager":
      return invokeEvaluationRecordManager(request as Parameters<typeof invokeEvaluationRecordManager>[0])
    case "evaluation_history_manager":
      return invokeEvaluationHistoryManager(request as Parameters<typeof invokeEvaluationHistoryManager>[0])
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



