export const scoringGateRules = {
  reject: ["weightedScore < 2.0", "value < 2", "quality < 2"],
  hold: ["confidence < 0.55", "reliability < 2.5"],
  improve: ["weightedScore >= 2.0 && weightedScore < 3.5"],
  pass: ["weightedScore >= 3.5", "confidence >= 0.6", "value >= 3", "quality >= 3"],
  prioritize: ["weightedScore >= 4.2", "confidence >= 0.75", "value >= 4", "leverage >= 4"]
} as const
