import type { ContractInvocationLogEntry } from "../../../packages/shared"
import type { SystemKey } from "@/types/console"

export type SystemActivityManifest = {
  system: SystemKey
  source_mode: "live-endpoint" | "local-fallback"
  status: "available" | "fallback" | "unreachable"
  endpoint: string
  events: ContractInvocationLogEntry[]
}

function getActivityEndpoint(system: SystemKey) {
  const envMap: Record<SystemKey, string | undefined> = {
    radar: process.env.VISUALCLAUSE_RADAR_ACTIVITY_URL,
    builder: process.env.VISUALCLAUSE_BUILDER_ACTIVITY_URL,
    scoring: process.env.VISUALCLAUSE_SCORING_ACTIVITY_URL,
    betting: process.env.VISUALCLAUSE_BETTING_ACTIVITY_URL
  }

  const liveFallbackMap: Record<SystemKey, string> = {
    radar: "http://localhost:3001/api/activity",
    builder: "http://localhost:3002/api/activity",
    scoring: "http://localhost:3003/api/activity",
    betting: "http://localhost:3004/api/activity"
  }

  return envMap[system] ?? liveFallbackMap[system]
}

async function fetchWithRetry(endpoint: string, retries = 1) {
  let attempt = 0
  let lastError: unknown = null

  while (attempt <= retries) {
    try {
      return await fetch(endpoint, {
        cache: "no-store"
      })
    } catch (error) {
      lastError = error
      attempt += 1
    }
  }

  throw lastError instanceof Error ? lastError : new Error("activity fetch failed")
}

function getFallbackActivity(system: SystemKey): SystemActivityManifest {
  return {
    system,
    source_mode: "local-fallback",
    status: "fallback",
    endpoint: getActivityEndpoint(system),
    events: []
  }
}

export async function loadSystemActivity(system: SystemKey): Promise<SystemActivityManifest> {
  const endpoint = getActivityEndpoint(system)

  try {
    const response = await fetchWithRetry(endpoint)

    if (!response.ok) {
      return {
        ...getFallbackActivity(system),
        endpoint,
        status: "unreachable"
      }
    }

    const payload = (await response.json()) as {
      system?: SystemKey
      events?: ContractInvocationLogEntry[]
    }

    return {
      system,
      source_mode: endpoint.startsWith("http://localhost") ? "live-endpoint" : "live-endpoint",
      status: "available",
      endpoint,
      events: Array.isArray(payload.events) ? payload.events : []
    }
  } catch {
    return {
      ...getFallbackActivity(system),
      endpoint,
      status: "unreachable"
    }
  }
}

export async function loadAllSystemActivity() {
  const systems: SystemKey[] = ["radar", "builder", "scoring", "betting"]
  return Promise.all(systems.map((system) => loadSystemActivity(system)))
}
