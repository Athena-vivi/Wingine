import type { WeightConfig } from "@/types/scoring"

export const scoringWeights: WeightConfig = {
  problem: {
    value: 0.35,
    quality: 0.2,
    reliability: 0.2,
    leverage: 0.25
  },
  module: {
    value: 0.25,
    quality: 0.25,
    reliability: 0.25,
    leverage: 0.25
  },
  output: {
    value: 0.3,
    quality: 0.3,
    reliability: 0.25,
    leverage: 0.15
  },
  workflow: {
    value: 0.2,
    quality: 0.3,
    reliability: 0.3,
    leverage: 0.2
  }
}
