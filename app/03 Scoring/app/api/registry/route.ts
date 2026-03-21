import { NextResponse } from "next/server"

import { FLOW_CONTRACT_REGISTRY } from "../../../../SharedContracts/contracts/registry"
import { scoringCapabilityRegistry } from "@/capabilities/registry"
import { scoringProtocolRegistry } from "@/protocol/registry"

export async function GET() {
  return NextResponse.json({
    capabilities: scoringCapabilityRegistry,
    protocols: scoringProtocolRegistry,
    shared_flow_contracts: {
      outbound: ["scoring_to_betting", "scoring_to_builder_feedback", "scoring_to_radar_feedback"],
      inbound: ["builder_to_scoring"],
      registry: {
        builder_to_scoring: FLOW_CONTRACT_REGISTRY.builder_to_scoring,
        scoring_to_betting: FLOW_CONTRACT_REGISTRY.scoring_to_betting,
        scoring_to_builder_feedback: FLOW_CONTRACT_REGISTRY.scoring_to_builder_feedback,
        scoring_to_radar_feedback: FLOW_CONTRACT_REGISTRY.scoring_to_radar_feedback
      }
    }
  })
}
