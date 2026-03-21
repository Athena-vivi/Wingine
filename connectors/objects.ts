import {
  BET_STATUSES,
  FLOW_CONTRACT_REGISTRY,
  MODULE_STATUSES,
  OBJECT_TYPES,
  OUTPUT_STATUSES,
  PROBLEM_STATUSES,
  SCORE_STATUSES,
  WORKFLOW_STATUSES,
  type FlowContractName,
  type SharedObjectType
} from "../../SharedContracts"
import type { ConsoleObjectManifest, SystemKey } from "@/types/console"

const OWNER_SYSTEMS: Record<SharedObjectType, SystemKey[]> = {
  problem: ["radar"],
  module: ["builder"],
  output: ["builder"],
  workflow: ["builder"],
  score: ["scoring"],
  bet: ["betting"]
}

const VISIBLE_SYSTEMS: Record<SharedObjectType, SystemKey[]> = {
  problem: ["radar", "builder", "scoring", "betting"],
  module: ["builder", "scoring", "betting"],
  output: ["builder", "scoring", "betting"],
  workflow: ["builder", "scoring", "betting"],
  score: ["scoring", "betting", "builder", "radar"],
  bet: ["betting", "builder", "radar"]
}

const STATUS_FAMILIES: Record<SharedObjectType, readonly string[]> = {
  problem: PROBLEM_STATUSES,
  module: MODULE_STATUSES,
  output: OUTPUT_STATUSES,
  workflow: WORKFLOW_STATUSES,
  score: SCORE_STATUSES,
  bet: BET_STATUSES
}

function getInboundContracts(type: SharedObjectType): FlowContractName[] {
  return Object.values(FLOW_CONTRACT_REGISTRY)
    .filter((contract) => contract.input_type === type)
    .map((contract) => contract.name)
}

function getOutboundContracts(type: SharedObjectType): FlowContractName[] {
  return Object.values(FLOW_CONTRACT_REGISTRY)
    .filter((contract) => contract.output_type === type)
    .map((contract) => contract.name)
}

export function loadObjectManifests(): ConsoleObjectManifest[] {
  return OBJECT_TYPES.map((type) => {
    const inbound = getInboundContracts(type)
    const outbound = getOutboundContracts(type)

    return {
      type,
      owner_systems: OWNER_SYSTEMS[type],
      visible_in_systems: VISIBLE_SYSTEMS[type],
      inbound_contracts: inbound,
      outbound_contracts: outbound,
      next_contracts: inbound,
      status_family: [...STATUS_FAMILIES[type]]
    }
  })
}
