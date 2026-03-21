import type { SystemHealthManifest, SystemKey } from "@/types/console"

function getHealthEndpoint(system: SystemKey) {
  const envMap: Record<SystemKey, string | undefined> = {
    radar: process.env.VISUALCLAUSE_RADAR_HEALTH_URL,
    builder: process.env.VISUALCLAUSE_BUILDER_HEALTH_URL,
    scoring: process.env.VISUALCLAUSE_SCORING_HEALTH_URL,
    betting: process.env.VISUALCLAUSE_BETTING_HEALTH_URL
  }

  const liveFallbackMap: Record<SystemKey, string> = {
    radar: "http://localhost:3001/api/health",
    builder: "http://localhost:3002/api/health",
    scoring: "http://localhost:3003/api/health",
    betting: "http://localhost:3004/api/health"
  }

  return envMap[system] ?? liveFallbackMap[system]
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

  throw lastError instanceof Error ? lastError : new Error("health fetch failed")
}

function getFallbackHealth(system: SystemKey, endpoint: string): SystemHealthManifest {
  return {
    system,
    endpoint,
    source_mode: "local-fallback",
    status: "fallback",
    ok: false,
    activity_count: 0,
    protocol_cache_count: 0
  }
}

export async function loadSystemHealth(system: SystemKey): Promise<SystemHealthManifest> {
  const endpoint = getHealthEndpoint(system)

  try {
    const response = await fetchWithRetry(endpoint)

    if (!response.ok) {
      return {
        ...getFallbackHealth(system, endpoint),
        status: "unreachable"
      }
    }

    const payload = (await response.json()) as Partial<SystemHealthManifest> & { ok?: boolean }

    return {
      system,
      endpoint,
      source_mode: "live-endpoint",
      status: "available",
      ok: Boolean(payload.ok),
      activity_count: typeof payload.activity_count === "number" ? payload.activity_count : 0,
      protocol_cache_count: typeof payload.protocol_cache_count === "number" ? payload.protocol_cache_count : 0,
      feedback_state_count:
        typeof payload.feedback_state_count === "number" ? payload.feedback_state_count : undefined
    }
  } catch {
    return {
      ...getFallbackHealth(system, endpoint),
      status: "unreachable"
    }
  }
}

export async function loadAllSystemHealth() {
  const systems: SystemKey[] = ["radar", "builder", "scoring", "betting"]
  return Promise.all(systems.map((system) => loadSystemHealth(system)))
}
