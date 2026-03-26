export const bettingAllocations = {
  kill: {
    time: "zero",
    priority: "none",
    action: "remove from active allocation"
  },
  hold: {
    time: "minimal",
    priority: "low",
    action: "park and monitor"
  },
  explore: {
    time: "small",
    priority: "medium",
    action: "test and gather more signal"
  },
  double_down: {
    time: "high",
    priority: "high",
    action: "increase depth on current candidate"
  },
  scale: {
    time: "very_high",
    priority: "highest",
    action: "expand breadth and rollout"
  }
} as const
