import type { ScoreObject } from "../../SharedContracts"
import type { BettingCandidate, BettingInput } from "@/types/betting"

export type ImportedScoreSignal = {
  candidate: BettingCandidate
  input: BettingInput
}

export function importScoreObjectToBettingSignal(score: ScoreObject): ImportedScoreSignal {
  const objectType = String(score.metadata.custom.object_type ?? "problem") as BettingCandidate["objectType"]

  return {
    candidate: {
      id: score.object_id,
      objectType,
      objectName: score.object_id,
      source: score.source.system,
      status: score.status
    },
    input: {
      score: score.weighted_score,
      confidence: score.confidence,
      trend: "flat",
      cost: 2
    }
  }
}
