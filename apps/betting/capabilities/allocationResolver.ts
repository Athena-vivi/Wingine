import { bettingAllocations } from "@/data/bettingAllocations"
import type { BettingDecision, ResourceAllocation } from "@/types/betting"
import type { CapabilityDefinition, ProtocolRequest, ProtocolResponse } from "@/types/protocol"

type Payload = {
  decision: BettingDecision
}

type Data = {
  resource_allocation: ResourceAllocation
}

export const allocationResolverCapability: CapabilityDefinition = {
  name: "allocation_resolver",
  purpose: "Translate a betting decision into concrete resource allocation output.",
  input_schema: {
    decision: "kill|hold|explore|double_down|scale"
  },
  process_logic: [
    "map decision to time allocation",
    "map decision to priority",
    "map decision to action directive"
  ],
  output_schema: {
    resource_allocation: "resource_allocation"
  },
  state: "idle|mapping|ready|error",
  trigger: "called after decision is resolved",
  error_handling: {
    decision_missing: "return error state",
    decision_invalid: "reject allocation mapping"
  }
}

export function invokeAllocationResolver(
  request: ProtocolRequest<Payload>
): ProtocolResponse<Data> {
  const allocation = bettingAllocations[request.payload.decision]

  if (!allocation) {
    return {
      request_id: request.request_id,
      capability: allocationResolverCapability.name,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "decision_invalid",
        message: "allocation could not be mapped"
      }
    }
  }

  return {
    request_id: request.request_id,
    capability: allocationResolverCapability.name,
    status: "success",
    state: "ready",
    data: {
      resource_allocation: allocation
    },
    error: null
  }
}
