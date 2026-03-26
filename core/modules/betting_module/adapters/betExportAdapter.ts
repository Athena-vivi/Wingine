import type { BetObject, BetStatus } from "../../shared/index.ts"
import type { BettingRecord } from "../types/betting.ts"

function resolveBetStatus(record: BettingRecord): BetStatus {
  switch (record.decision) {
    case "hold":
      return "held"
    case "kill":
      return "killed"
    case "scale":
      return "scaled"
    default:
      return "active"
  }
}

export function exportBetObjectFromBettingRecord(record: BettingRecord): BetObject {
  const status = resolveBetStatus(record)

  return {
    id: `bet_${record.id}`,
    type: "bet",
    source: {
      system: "betting",
      origin_id: record.id,
      origin_ref: record.objectId
    },
    status,
    metadata: {
      tags: [record.objectType, record.decision],
      labels: [record.objectName],
      custom: {
        object_type: record.objectType,
        decision: record.decision
      }
    },
    timestamps: {
      created_at: record.timestamp,
      updated_at: new Date().toISOString(),
      observed_at: new Date().toISOString()
    },
    object_id: record.objectId,
    input: record.input,
    resource_allocation: record.resourceAllocation,
    reason: record.reason
  }
}


