import type { ScoreStatus } from "../enums/statuses"
import type { SharedObjectBase } from "./base"

export type ScoreDimensions = {
  value: number
  quality: number
  reliability: number
  leverage: number
}

export type ScoreObject = SharedObjectBase<"score", ScoreStatus> & {
  object_id: string
  dimensions: ScoreDimensions
  weighted_score: number
  confidence: number
}
