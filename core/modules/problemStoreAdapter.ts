import type { ProblemObject } from "./shared/index.ts"

type StoredProblemRecord = {
  storage_ref: string
  problem: ProblemObject
  stored_at: string
}

export function createProblemStoreAdapter() {
  const records = new Map<string, StoredProblemRecord>()

  return {
    async store(problem: ProblemObject) {
      const storageRef = `problem_store://${problem.id}`
      const storedAt = new Date().toISOString()

      records.set(problem.id, {
        storage_ref: storageRef,
        problem,
        stored_at: storedAt
      })

      return {
        storage_ref: storageRef,
        stored_at: storedAt
      }
    },
    count() {
      return records.size
    },
    get(problemId: string) {
      return records.get(problemId) ?? null
    }
  }
}
