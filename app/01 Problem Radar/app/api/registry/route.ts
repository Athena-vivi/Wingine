import { NextResponse } from "next/server"

import { FLOW_CONTRACT_REGISTRY } from "../../../../SharedContracts/contracts/registry"
import { radarCapabilityRegistry } from "@/capabilities/registry"
import { radarProtocolRegistry } from "@/protocol/registry"

export async function GET() {
  return NextResponse.json({
    capabilities: radarCapabilityRegistry,
    protocols: radarProtocolRegistry,
    shared_flow_contracts: {
      outbound: ["radar_to_builder"],
      inbound: ["scoring_to_radar_feedback", "betting_to_radar_feedback"],
      registry: {
        radar_to_builder: FLOW_CONTRACT_REGISTRY.radar_to_builder,
        scoring_to_radar_feedback: FLOW_CONTRACT_REGISTRY.scoring_to_radar_feedback,
        betting_to_radar_feedback: FLOW_CONTRACT_REGISTRY.betting_to_radar_feedback
      }
    }
  })
}
