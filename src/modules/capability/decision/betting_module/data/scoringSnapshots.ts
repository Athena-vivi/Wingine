import type { BettingObjectType, TrendValue } from "../types/betting.ts"

export type ScoringSignalSnapshot = {
  objectId: string
  objectType: BettingObjectType
  score: number
  confidence: number
  trend: TrendValue
}

export const scoringSnapshots: ScoringSignalSnapshot[] = [
  {
    objectId: "problem-001",
    objectType: "problem",
    score: 3.9,
    confidence: 0.73,
    trend: "up"
  },
  {
    objectId: "module-001",
    objectType: "module",
    score: 3.7,
    confidence: 0.7,
    trend: "flat"
  },
  {
    objectId: "output-001",
    objectType: "output",
    score: 3.43,
    confidence: 0.69,
    trend: "flat"
  },
  {
    objectId: "workflow-001",
    objectType: "workflow",
    score: 3.53,
    confidence: 0.7,
    trend: "up"
  }
]


