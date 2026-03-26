import type { BettingCandidate, BettingDecision, BettingInput, BettingRecord, ResourceAllocation } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = {
  action?: "create" | "persist"
  candidate: BettingCandidate
  input: BettingInput
  normalized_factors: BettingRecord["normalizedFactors"]
  decision: BettingDecision
  resource_allocation: ResourceAllocation
  reason: string
}

type Data = {
  record: BettingRecord
}

export const decisionRecordManagerCapability: CapabilityDefinition = {
  name: "decision_record_manager",
  purpose: "Create, update, and persist the betting decision record.",
  input_schema: {
    candidate: "betting_candidate",
    input: "betting_input",
    normalized_factors: "normalized_factors",
    decision: "betting_decision",
    resource_allocation: "resource_allocation",
    reason: "string"
  },
  process_logic: [
    "build normalized betting record",
    "persist current decision state",
    "return active decision record"
  ],
  output_schema: {
    record: "betting_record"
  },
  state: "idle|creating|persisting|ready|error",
  trigger: "called after allocation is resolved or save is requested",
  error_handling: {
    invalid_record: "reject persistence",
    persist_failure: "return unsaved error state"
  }
}

export function invokeDecisionRecordManager(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const { candidate, input, normalized_factors, decision, resource_allocation, reason } = request.payload

  return {
    request_id: request.request_id,
    capability: decisionRecordManagerCapability.name,
    status: "success",
    state: "ready",
    data: {
      record: {
        id: `${candidate.objectType}-${candidate.id}-bet`,
        objectId: candidate.id,
        objectType: candidate.objectType,
        objectName: candidate.objectName,
        input,
        normalizedFactors: normalized_factors,
        decision,
        resourceAllocation: resource_allocation,
        reason,
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    },
    error: null
  }
}
