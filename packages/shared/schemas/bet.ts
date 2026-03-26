import type { BetStatus } from "../enums/statuses"
import type { SharedObjectBase } from "./base"

export type BetInput = {
  score: number
  confidence: number
  trend: "up" | "flat" | "down"
  cost: number
}

export type ResourceAllocation = {
  time: string
  priority: string
  action: string
}

export type BetObject = SharedObjectBase<"bet", BetStatus> & {
  object_id: string
  input: BetInput
  resource_allocation: ResourceAllocation
  reason: string
}
