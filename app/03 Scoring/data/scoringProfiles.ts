import type { TypeProfile } from "@/types/scoring"

export const scoringProfiles: TypeProfile[] = [
  {
    id: "problem-profile",
    objectType: "problem",
    dimensions: {
      value: {
        meaning: "Whether the problem is worth solving.",
        highScoreRule: ["Pain is strong", "Frequency is high", "Cost is high", "Target user is clear"],
        lowScoreRule: ["Pain is weak", "Frequency is low", "Cost is unclear", "Target user is unclear"]
      },
      quality: {
        meaning: "Whether the problem definition is clear enough to act on.",
        highScoreRule: ["Boundary is clear", "Context is clear", "Inputs are clear", "Evaluation criteria exist"],
        lowScoreRule: ["Definition is vague", "Boundary is missing", "Context is weak", "Cannot be evaluated"]
      },
      reliability: {
        meaning: "Whether the problem is stable and repeatedly observable.",
        highScoreRule: ["Evidence is repeatable", "Signals are consistent", "Not an outlier"],
        lowScoreRule: ["Only anecdotal", "Signals conflict", "Likely temporary noise"]
      },
      leverage: {
        meaning: "Whether solving the problem creates reusable system value.",
        highScoreRule: ["Can create reusable modules", "Can support multiple outputs", "Can improve multiple workflows"],
        lowScoreRule: ["One-off issue", "Narrow local gain", "Low reuse potential"]
      }
    }
  },
  {
    id: "module-profile",
    objectType: "module",
    dimensions: {
      value: {
        meaning: "Whether the module deserves a permanent place in the system.",
        highScoreRule: ["Supports multiple workflows", "Solves a critical step", "Covers recurring needs"],
        lowScoreRule: ["Rarely used", "Edge utility only", "No clear necessity"]
      },
      quality: {
        meaning: "Whether the module definition is clear and structurally usable.",
        highScoreRule: ["Input is clear", "Process is clear", "Output is clear", "Trigger is clear"],
        lowScoreRule: ["Scope is fuzzy", "Input/output unclear", "No stable definition"]
      },
      reliability: {
        meaning: "Whether the module behaves consistently and predictably.",
        highScoreRule: ["Behavior is stable", "Dependencies are visible", "Failure boundary is known"],
        lowScoreRule: ["Behavior drifts", "Dependencies are fragile", "Failure is unpredictable"]
      },
      leverage: {
        meaning: "Whether the module can be reused and combined broadly.",
        highScoreRule: ["Reusable", "Composable", "Extensible"],
        lowScoreRule: ["One-off", "Hard to compose", "Hard to extend"]
      }
    }
  },
  {
    id: "output-profile",
    objectType: "output",
    dimensions: {
      value: {
        meaning: "Whether the output is worth delivering.",
        highScoreRule: ["Solves the target problem", "Clear user gain", "Delivery target is clear"],
        lowScoreRule: ["Weak benefit", "Misaligned to problem", "Delivery target is vague"]
      },
      quality: {
        meaning: "Whether the output is complete and usable.",
        highScoreRule: ["Usable", "Readable", "Verifiable", "Structurally complete"],
        lowScoreRule: ["Incomplete", "Broken", "Hard to validate", "Low usability"]
      },
      reliability: {
        meaning: "Whether the output can be used consistently.",
        highScoreRule: ["Behavior is stable", "Dependencies are stable", "Failure risk is controlled"],
        lowScoreRule: ["Behavior is unstable", "Dependencies drift", "High failure risk"]
      },
      leverage: {
        meaning: "Whether the output becomes a long-term system asset.",
        highScoreRule: ["Reusable", "Template-worthy", "Extendable"],
        lowScoreRule: ["One-time artifact", "Hard to reuse", "Low extension value"]
      }
    }
  },
  {
    id: "workflow-profile",
    objectType: "workflow",
    dimensions: {
      value: {
        meaning: "Whether the workflow is worth preserving as a repeatable path.",
        highScoreRule: ["Pushes a real problem forward", "Removes key friction", "Connects critical resources"],
        lowScoreRule: ["Weak contribution", "Redundant", "Does not move the outcome"]
      },
      quality: {
        meaning: "Whether the workflow is well-formed.",
        highScoreRule: ["Step order is clear", "Dependencies are clear", "Transitions are clear"],
        lowScoreRule: ["Sequence is broken", "Dependencies are unclear", "Steps do not connect"]
      },
      reliability: {
        meaning: "Whether the workflow can be repeated without drift.",
        highScoreRule: ["Stable steps", "Stable dependencies", "Known failure path"],
        lowScoreRule: ["Drifts often", "Fragile dependencies", "Failure path unclear"]
      },
      leverage: {
        meaning: "Whether the workflow can become a reusable pattern.",
        highScoreRule: ["Template-worthy", "Portable", "Supports multiple problems"],
        lowScoreRule: ["Only fits one case", "Not portable", "Low extension value"]
      }
    }
  }
]
