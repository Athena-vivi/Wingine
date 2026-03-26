import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

import type { RadarProtocolResponse } from "@/types/protocol"

type CacheRecord = {
  request_id: string
  protocol_name: string
  response: RadarProtocolResponse<Record<string, unknown>>
  cached_at: string
}

const STORAGE_PATH = path.join(process.cwd(), "data", "protocol-response-cache.json")

async function ensureStoreDir() {
  await mkdir(path.dirname(STORAGE_PATH), { recursive: true })
}

async function readCache(): Promise<CacheRecord[]> {
  try {
    const content = await readFile(STORAGE_PATH, "utf8")
    return JSON.parse(content) as CacheRecord[]
  } catch {
    return []
  }
}

async function writeCache(records: CacheRecord[]) {
  await ensureStoreDir()
  await writeFile(STORAGE_PATH, JSON.stringify(records, null, 2), "utf8")
}

export async function getCachedRadarProtocolResponse(requestId: string, protocolName: string) {
  const records = await readCache()
  return records.find((item) => item.request_id === requestId && item.protocol_name === protocolName)?.response ?? null
}

export async function cacheRadarProtocolResponse(
  requestId: string,
  protocolName: string,
  response: RadarProtocolResponse<Record<string, unknown>>
) {
  const records = await readCache()
  const nextRecords = [
    {
      request_id: requestId,
      protocol_name: protocolName,
      response,
      cached_at: new Date().toISOString()
    },
    ...records.filter((item) => !(item.request_id === requestId && item.protocol_name === protocolName))
  ].slice(0, 200)

  await writeCache(nextRecords)
}

export async function getRadarProtocolCacheCount() {
  const records = await readCache()
  return records.length
}
