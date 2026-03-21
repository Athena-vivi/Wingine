import {
  FLOW_CONTRACTS,
  FLOW_CONTRACT_REGISTRY,
  MVP_FLOW_CONTRACTS,
  type FlowContractName
} from "../../SharedContracts"
import type { SystemRegistryManifest } from "@/types/console"

function pickContracts(names: FlowContractName[]) {
  return Object.fromEntries(names.map((name) => [name, FLOW_CONTRACT_REGISTRY[name]]))
}

const fallbackRegistryManifests: SystemRegistryManifest[] = [
  {
    system: "radar",
    registry_endpoint: "/api/systems/radar/registry",
    health_endpoint: "/api/systems/radar/health",
    source_mode: "local-fallback",
    registry_status: "fallback",
    capabilities: [
      "source_input_resolver",
      "reddit_source_fetcher",
      "manual_source_builder",
      "source_material_normalizer",
      "problem_analysis_engine",
      "radar_record_builder",
      "insight_draft_builder",
      "radar_record_searcher",
      "radar_record_mapper",
      "radar_record_upsertor",
      "content_generation_engine",
      "content_rewrite_engine",
      "output_bundle_manager"
    ],
    protocols: [
      "workspace_load",
      "source_analyze",
      "radar_save",
      "content_generate",
      "content_rewrite",
      "problem_export",
      "scoring_to_radar_feedback",
      "betting_to_radar_feedback"
    ],
    shared_flow_contracts: {
      outbound: ["radar_to_builder"],
      inbound: ["scoring_to_radar_feedback", "betting_to_radar_feedback"],
      registry: pickContracts(["radar_to_builder", "scoring_to_radar_feedback", "betting_to_radar_feedback"])
    }
  },
  {
    system: "builder",
    registry_endpoint: "/api/systems/builder/registry",
    health_endpoint: "/api/systems/builder/health",
    source_mode: "local-fallback",
    registry_status: "fallback",
    capabilities: [
      "builder_record_manager",
      "workflow_manager",
      "workflow_step_linker",
      "capability_attachment_manager",
      "capability_detail_resolver",
      "output_manager",
      "ui_template_manager"
    ],
    protocols: [
      "builder_load",
      "workflow_update",
      "workflow_link_update",
      "capability_attachment_update",
      "output_update",
      "builder_persist",
      "problem_import",
      "workflow_export",
      "scoring_to_builder_feedback",
      "betting_to_builder_feedback"
    ],
    shared_flow_contracts: {
      outbound: ["builder_to_scoring"],
      inbound: ["radar_to_builder", "scoring_to_builder_feedback", "betting_to_builder_feedback"],
      registry: pickContracts([
        "radar_to_builder",
        "builder_to_scoring",
        "scoring_to_builder_feedback",
        "betting_to_builder_feedback"
      ])
    }
  },
  {
    system: "scoring",
    registry_endpoint: "/api/systems/scoring/registry",
    health_endpoint: "/api/systems/scoring/health",
    source_mode: "local-fallback",
    registry_status: "fallback",
    capabilities: [
      "object_context_loader",
      "type_profile_resolver",
      "dimension_score_manager",
      "score_aggregator",
      "confidence_resolver",
      "gate_resolver",
      "role_input_manager",
      "evaluation_record_manager",
      "evaluation_history_manager"
    ],
    protocols: [
      "workspace_load",
      "workspace_select",
      "dimension_update",
      "role_update",
      "workspace_persist",
      "workflow_import",
      "score_export"
    ],
    shared_flow_contracts: {
      outbound: ["scoring_to_betting", "scoring_to_builder_feedback", "scoring_to_radar_feedback"],
      inbound: ["builder_to_scoring"],
      registry: pickContracts([
        "builder_to_scoring",
        "scoring_to_betting",
        "scoring_to_builder_feedback",
        "scoring_to_radar_feedback"
      ])
    }
  },
  {
    system: "betting",
    registry_endpoint: "/api/systems/betting/registry",
    health_endpoint: "/api/systems/betting/health",
    source_mode: "local-fallback",
    registry_status: "fallback",
    capabilities: [
      "candidate_pool_loader",
      "scoring_signal_adapter",
      "betting_input_resolver",
      "factor_normalizer",
      "decision_resolver",
      "allocation_resolver",
      "decision_record_manager",
      "betting_history_manager"
    ],
    protocols: [
      "candidate_load",
      "bet_evaluate",
      "bet_persist",
      "bet_history_load",
      "score_import",
      "bet_export"
    ],
    shared_flow_contracts: {
      outbound: ["betting_to_builder_feedback", "betting_to_radar_feedback"],
      inbound: ["scoring_to_betting"],
      registry: pickContracts([
        "scoring_to_betting",
        "betting_to_builder_feedback",
        "betting_to_radar_feedback"
      ])
    }
  }
]

export const systemRegistryManifests = fallbackRegistryManifests

export function getSystemRegistry(system: SystemRegistryManifest["system"]) {
  return systemRegistryManifests.find((item) => item.system === system)
}

export function getFallbackSystemRegistry(system: SystemRegistryManifest["system"]) {
  return fallbackRegistryManifests.find((item) => item.system === system)
}

function getLiveRegistryEndpoint(system: SystemRegistryManifest["system"]): string | null {
  const envMap: Record<SystemRegistryManifest["system"], string | undefined> = {
    radar: process.env.VISUALCLAUSE_RADAR_REGISTRY_URL,
    builder: process.env.VISUALCLAUSE_BUILDER_REGISTRY_URL,
    scoring: process.env.VISUALCLAUSE_SCORING_REGISTRY_URL,
    betting: process.env.VISUALCLAUSE_BETTING_REGISTRY_URL
  }

  const fallbackLiveMap: Record<SystemRegistryManifest["system"], string> = {
    radar: "http://localhost:3001/api/registry",
    builder: "http://localhost:3002/api/registry",
    scoring: "http://localhost:3003/api/registry",
    betting: "http://localhost:3004/api/registry"
  }

  return envMap[system] ?? fallbackLiveMap[system]
}

async function fetchWithRetry(endpoint: string, retries = 1) {
  let attempt = 0
  let lastError: unknown = null

  while (attempt <= retries) {
    try {
      return await fetch(endpoint, { cache: "no-store" })
    } catch (error) {
      lastError = error
      attempt += 1
    }
  }

  throw lastError instanceof Error ? lastError : new Error("registry fetch failed")
}

function normalizeCapabilities(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .map((item) => {
      if (typeof item === "string") {
        return item
      }

      if (item && typeof item === "object" && "name" in item && typeof item.name === "string") {
        return item.name
      }

      return null
    })
    .filter((item): item is string => Boolean(item))
}

function normalizeProtocols(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is string => typeof item === "string")
  }

  if (payload && typeof payload === "object") {
    const directProtocols =
      "protocols" in payload && Array.isArray(payload.protocols)
        ? payload.protocols.filter((item): item is string => typeof item === "string")
        : []

    const compositeProtocols =
      "composite_protocols" in payload && Array.isArray(payload.composite_protocols)
        ? payload.composite_protocols.filter((item): item is string => typeof item === "string")
        : []

    return [...directProtocols, ...compositeProtocols]
  }

  return []
}

function normalizeSharedFlowContracts(
  system: SystemRegistryManifest["system"],
  payload: unknown
): SystemRegistryManifest["shared_flow_contracts"] {
  const fallback = getFallbackSystemRegistry(system)

  if (!fallback) {
    throw new Error(`Unknown system registry: ${system}`)
  }

  if (!payload || typeof payload !== "object" || !("outbound" in payload) || !("inbound" in payload)) {
    return fallback.shared_flow_contracts
  }

  const outbound = Array.isArray(payload.outbound)
    ? payload.outbound.filter((item): item is FlowContractName => typeof item === "string" && item in FLOW_CONTRACT_REGISTRY)
    : fallback.shared_flow_contracts.outbound

  const inbound = Array.isArray(payload.inbound)
    ? payload.inbound.filter((item): item is FlowContractName => typeof item === "string" && item in FLOW_CONTRACT_REGISTRY)
    : fallback.shared_flow_contracts.inbound

  const names = Array.from(new Set([...outbound, ...inbound]))

  return {
    outbound,
    inbound,
    registry: pickContracts(names)
  }
}

function normalizeLiveRegistry(
  system: SystemRegistryManifest["system"],
  endpoint: string,
  payload: unknown
): SystemRegistryManifest {
  const fallback = getFallbackSystemRegistry(system)

  if (!fallback || !payload || typeof payload !== "object") {
    throw new Error(`Invalid registry payload for ${system}`)
  }

  const record = payload as Record<string, unknown>

  return {
    system,
    registry_endpoint: endpoint,
    source_mode: "live-endpoint",
    registry_status: "available",
    capabilities: normalizeCapabilities(record.capabilities),
    protocols: normalizeProtocols(record.protocols),
    shared_flow_contracts: normalizeSharedFlowContracts(system, record.shared_flow_contracts)
  }
}

export async function loadSystemRegistry(system: SystemRegistryManifest["system"]): Promise<SystemRegistryManifest> {
  const fallback = getFallbackSystemRegistry(system)

  if (!fallback) {
    throw new Error(`Unknown system registry: ${system}`)
  }

  const liveEndpoint = getLiveRegistryEndpoint(system)

  if (!liveEndpoint) {
    return fallback
  }

  try {
    const response = await fetchWithRetry(liveEndpoint)

    if (!response.ok) {
      return {
        ...fallback,
        registry_endpoint: liveEndpoint,
        health_endpoint: fallback.health_endpoint,
        registry_status: "unreachable"
      }
    }

    const payload = (await response.json()) as unknown
    return normalizeLiveRegistry(system, liveEndpoint, payload)
  } catch {
    return {
      ...fallback,
      registry_endpoint: liveEndpoint,
      health_endpoint: fallback.health_endpoint,
      registry_status: "unreachable"
    }
  }
}

export async function loadAllSystemRegistries(): Promise<SystemRegistryManifest[]> {
  return Promise.all(
    fallbackRegistryManifests.map(async (manifest) => loadSystemRegistry(manifest.system))
  )
}

export function getMainFlowContracts() {
  return MVP_FLOW_CONTRACTS.map((name) => FLOW_CONTRACT_REGISTRY[name])
}

export function getFeedbackFlowContracts() {
  return FLOW_CONTRACTS.filter((name) => !MVP_FLOW_CONTRACTS.includes(name)).map(
    (name) => FLOW_CONTRACT_REGISTRY[name]
  )
}
