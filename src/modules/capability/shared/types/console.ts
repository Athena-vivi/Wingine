import type { SharedObjectType } from "../enums/objectTypes.ts"
import type { FlowContractName } from "../contracts/names.ts"
import type { FlowContractSpec } from "../contracts/registry.ts"

export type SystemKey = "radar" | "builder" | "scoring" | "betting"

export type RegistrySource = "live-endpoint" | "local-fallback"

export type SystemRegistryManifest = {
  system: SystemKey
  registry_endpoint: string
  health_endpoint?: string
  source_mode: RegistrySource
  registry_status?: "available" | "fallback" | "unreachable"
  capabilities: string[]
  protocols: string[]
  shared_flow_contracts: {
    outbound: FlowContractName[]
    inbound: FlowContractName[]
    registry: Partial<Record<FlowContractName, FlowContractSpec>>
  }
}

export type SystemHealthManifest = {
  system: SystemKey
  endpoint: string
  source_mode: RegistrySource
  status: "available" | "fallback" | "unreachable"
  ok: boolean
  activity_count: number
  protocol_cache_count: number
  feedback_state_count?: number
}

export type ConsoleObjectManifest = {
  type: SharedObjectType
  owner_systems: SystemKey[]
  visible_in_systems: SystemKey[]
  inbound_contracts: FlowContractName[]
  outbound_contracts: FlowContractName[]
  next_contracts: FlowContractName[]
  status_family: string[]
}

export type ConsoleTraceStep = {
  order: number
  contract: FlowContractName
  producer: SystemKey
  consumer: SystemKey
  input_type: SharedObjectType
  output_type: SharedObjectType
  mode: "forward" | "feedback"
}

export type ConsoleTraceManifest = {
  name: string
  type: "main-chain" | "feedback-chain"
  steps: ConsoleTraceStep[]
}

export type ObjectTraceEvent = {
  id: string
  system: SystemKey
  protocol_name: string
  contract_name: string | null
  status: "success" | "error"
  state: string
  gate_result: "pass" | "hold" | "reject" | null
  role: "input" | "output"
  object_id: string
  timestamp: string
}

export type ObjectTraceManifest = {
  object_id: string
  events: ObjectTraceEvent[]
  systems: SystemKey[]
  contracts: string[]
}

