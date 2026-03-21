import { NextResponse } from "next/server"

import { FLOW_CONTRACT_REGISTRY } from "../../../../SharedContracts/contracts/registry"
import { builderCapabilityRegistry } from "@/capabilities/registry"
import { builderProtocolRegistry } from "@/protocol/registry"

export async function GET() {
  return NextResponse.json({
    capabilities: builderCapabilityRegistry,
    protocols: builderProtocolRegistry,
    shared_flow_contracts: {
      outbound: ["builder_to_scoring"],
      inbound: ["radar_to_builder", "scoring_to_builder_feedback", "betting_to_builder_feedback"],
      registry: {
        radar_to_builder: FLOW_CONTRACT_REGISTRY.radar_to_builder,
        builder_to_scoring: FLOW_CONTRACT_REGISTRY.builder_to_scoring,
        scoring_to_builder_feedback: FLOW_CONTRACT_REGISTRY.scoring_to_builder_feedback,
        betting_to_builder_feedback: FLOW_CONTRACT_REGISTRY.betting_to_builder_feedback
      }
    }
  })
}
