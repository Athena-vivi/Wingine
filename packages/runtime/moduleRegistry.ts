import type { RegistryRecord } from "./types.ts"

export function createModuleRegistry() {
  const records = new Map<string, RegistryRecord>()

  return {
    register(record: RegistryRecord): void {
      records.set(record.module.module_id, record)
    },
    get(moduleId: string): RegistryRecord | null {
      return records.get(moduleId) ?? null
    },
    list(): RegistryRecord[] {
      return Array.from(records.values())
    }
  }
}
