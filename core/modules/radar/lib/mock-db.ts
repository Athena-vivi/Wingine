import type { RadarRecord } from "../types/radar.ts"

declare global {
  // eslint-disable-next-line no-var
  var __redditInsightDeskMockStore: Map<string, { id: string; record: RadarRecord }> | undefined
}

const store =
  globalThis.__redditInsightDeskMockStore ??
  new Map<string, { id: string; record: RadarRecord }>()

if (!globalThis.__redditInsightDeskMockStore) {
  globalThis.__redditInsightDeskMockStore = store
}

export function getMockRecord(sourceUrl: string) {
  return store.get(sourceUrl)
}

export function saveMockRecord(record: RadarRecord) {
  const existing = store.get(record.source_url)
  const id = existing?.id ?? `mock_${store.size + 1}`

  store.set(record.source_url, { id, record })

  return {
    id,
    action: (existing ? "updated" : "created") as "updated" | "created"
  }
}


