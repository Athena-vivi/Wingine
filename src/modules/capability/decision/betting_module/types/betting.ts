export type BettingObjectType = "problem" | "module" | "output" | "workflow"

export type TrendValue = "up" | "flat" | "down"

export type BettingDecision = "kill" | "hold" | "explore" | "double_down" | "scale"

export type FactorBand = "high" | "medium" | "low"

export type BettingCandidate = {
  id: string
  objectType: BettingObjectType
  objectName: string
  source?: string
  status?: string
}

export type BettingInput = {
  score: number
  confidence: number
  trend: TrendValue
  cost: number
}

export type ResourceAllocation = {
  time: "zero" | "minimal" | "small" | "high" | "very_high"
  priority: "none" | "low" | "medium" | "high" | "highest"
  action: string
}

export type BettingRecord = {
  id: string
  objectId: string
  objectType: BettingObjectType
  objectName: string
  input: BettingInput
  normalizedFactors: {
    scoreBand: FactorBand
    confidenceBand: FactorBand
    trendBand: TrendValue
    costBand: FactorBand
  }
  decision: BettingDecision
  resourceAllocation: ResourceAllocation
  reason: string
  timestamp: string
  version: string
}
