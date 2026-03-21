import { NextResponse } from "next/server"

import { FLOW_CONTRACT_REGISTRY } from "../../../SharedContracts/contracts/registry"
import { bettingCapabilityRegistry } from "@/capabilities/registry"
import { bettingProtocolRegistry } from "@/protocol/registry"

export async function GET() {
  return NextResponse.json({
    capabilities: bettingCapabilityRegistry.map((capability) => capability.name),
    protocols: bettingProtocolRegistry,
    shared_flow_contracts: {
      outbound: ["betting_to_builder_feedback", "betting_to_radar_feedback"],
      inbound: ["scoring_to_betting"],
      registry: {
        scoring_to_betting: FLOW_CONTRACT_REGISTRY.scoring_to_betting,
        betting_to_builder_feedback: FLOW_CONTRACT_REGISTRY.betting_to_builder_feedback,
        betting_to_radar_feedback: FLOW_CONTRACT_REGISTRY.betting_to_radar_feedback
      }
    }
  }, {
    status: 200
  })
}
