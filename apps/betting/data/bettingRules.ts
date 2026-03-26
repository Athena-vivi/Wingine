export const bettingRules = {
  kill: ["score < 2.8", "trend = down", "cost >= 2"],
  hold: ["confidence < 0.55", "score >= 2.8 and score < 3.4", "trend = flat or down"],
  explore: ["score >= 3.2 and score < 4.0", "confidence >= 0.45 and confidence < 0.75", "cost < 4"],
  double_down: ["score >= 4.0", "confidence >= 0.6", "trend = up", "cost < 4"],
  scale: ["score >= 4.4", "confidence >= 0.75", "trend = up or flat", "cost < 2"]
} as const
