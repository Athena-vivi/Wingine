import { getMockRecord } from "@/lib/mock-db"
import type { RadarCapabilityDefinition, RadarRecord } from "@/types/radar"

const FEISHU_BASE_URL = "https://open.feishu.cn/open-apis"

function hasFeishuConfig() {
  return Boolean(
    process.env.FEISHU_APP_ID &&
      process.env.FEISHU_APP_SECRET &&
      process.env.FEISHU_APP_TOKEN &&
      process.env.FEISHU_TABLE_ID
  )
}

async function getTenantAccessToken() {
  const response = await fetch(`${FEISHU_BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      app_id: process.env.FEISHU_APP_ID,
      app_secret: process.env.FEISHU_APP_SECRET
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to get Feishu token: ${response.status}`)
  }

  const data = (await response.json()) as { tenant_access_token?: string; msg?: string }

  if (!data.tenant_access_token) {
    throw new Error(data.msg || "Missing Feishu tenant_access_token")
  }

  return data.tenant_access_token
}

async function feishuRequest<T>(path: string, init: RequestInit) {
  const token = await getTenantAccessToken()
  const response = await fetch(`${FEISHU_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  })

  if (!response.ok) {
    throw new Error(`Feishu API request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

export const radarRecordSearcherCapability: RadarCapabilityDefinition = {
  name: "radar_record_searcher",
  purpose: "Find an existing radar record by source url.",
  input_schema: {
    source_url: "string"
  },
  process_logic: [
    "validate source url",
    "search mock or feishu storage by source url",
    "return matched record state"
  ],
  output_schema: {
    existing_record: "record_match|null"
  },
  state: "idle|loading|ready|error",
  trigger: "called before radar upsert",
  error_handling: {
    missing_source_url: "throw validation error",
    search_failed: "return error state"
  }
}

export async function searchRadarRecord(sourceUrl: string): Promise<{
  recordId: string
  fields: RadarRecord | Record<string, unknown>
} | null> {
  if (!sourceUrl) {
    throw new Error("radarRecord.source_url is required.")
  }

  if (!hasFeishuConfig()) {
    const mock = getMockRecord(sourceUrl)
    return mock
      ? {
          recordId: mock.id,
          fields: mock.record
        }
      : null
  }

  const params = new URLSearchParams({
    filter: `CurrentValue.[source_url] = "${sourceUrl.replace(/"/g, '\\"')}"`
  })

  const data = await feishuRequest<{
    data?: {
      items?: Array<{ record_id: string; fields: Record<string, unknown> }>
    }
  }>(
    `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records/search?${params.toString()}`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  )

  const item = data.data?.items?.[0]

  if (!item) {
    return null
  }

  return {
    recordId: item.record_id,
    fields: item.fields
  }
}

export function getRadarStorageMode(): "mock" | "feishu" {
  return hasFeishuConfig() ? "feishu" : "mock"
}
