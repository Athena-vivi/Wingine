import type { ActivityLogRecord } from "./types.ts"

export function createActivityLogStore() {
  const records: ActivityLogRecord[] = []

  return {
    append(record: ActivityLogRecord): void {
      records.push(record)
    },
    count(): number {
      return records.length
    },
    list(): ActivityLogRecord[] {
      return [...records]
    }
  }
}
