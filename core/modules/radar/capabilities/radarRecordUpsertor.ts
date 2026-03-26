import { saveMockRecord } from "../lib/mock-db.ts"
import { getRadarStorageMode, searchRadarRecord } from "./radarRecordSearcher.ts"
import { mapRadarRecordToFields } from "./radarRecordMapper.ts"
import type { RadarCapabilityDefinition, RadarRecord, RadarSaveResult } from "../types/radar.ts"

const FEISHU_BASE_URL = "https://open.feishu.cn/open-apis"

function hasFeishuConfig() {
  return getRadarStorageMode() === "feishu"
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

async function createRadarRecord(record: RadarRecord) {
  if (!hasFeishuConfig()) {
    return saveMockRecord(record)
  }

  const data = await feishuRequest<{
    data?: {
      record?: { record_id: string }
    }
  }>(`/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records`, {
    method: "POST",
    body: JSON.stringify({
      fields: mapRadarRecordToFields(record)
    })
  })

  return {
    id: data.data?.record?.record_id || "",
    action: "created" as const
  }
}

async function updateRadarRecord(recordId: string, record: RadarRecord) {
  if (!hasFeishuConfig()) {
    return saveMockRecord(record)
  }

  await feishuRequest(
    `/bitable/v1/apps/${process.env.FEISHU_APP_TOKEN}/tables/${process.env.FEISHU_TABLE_ID}/records/${recordId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        fields: mapRadarRecordToFields(record)
      })
    }
  )

  return {
    id: recordId,
    action: "updated" as const
  }
}

export const radarRecordUpsertorCapability: RadarCapabilityDefinition = {
  name: "radar_record_upsertor",
  purpose: "Create or update one radar record in the configured storage.",
  input_schema: {
    radar_record: "radar_record"
  },
  process_logic: [
    "search existing record by source url",
    "map radar record into storage fields",
    "update existing record when found",
    "create new record when missing",
    "return sync result"
  ],
  output_schema: {
    save_result: "radar_save_result"
  },
  state: "idle|loading|persisting|ready|error",
  trigger: "called when radar save is requested",
  error_handling: {
    missing_source_url: "throw validation error",
    save_failed: "return error state"
  }
}

export async function upsertRadarRecordCapability(record: RadarRecord): Promise<RadarSaveResult> {
  if (!record.source_url) {
    throw new Error("radarRecord.source_url is required.")
  }

  const existing = await searchRadarRecord(record.source_url)

  if (existing?.recordId) {
    const result = await updateRadarRecord(existing.recordId, record)
    return {
      ok: true,
      mode: getRadarStorageMode(),
      action: result.action,
      recordId: result.id
    }
  }

  const result = await createRadarRecord(record)
  return {
    ok: true,
    mode: getRadarStorageMode(),
    action: result.action,
    recordId: result.id
  }
}


