import type { CapabilitySet } from "@/types/builder"

export const mockCapabilities: CapabilitySet[] = [
  {
    problemId: "p_001",
    items: [
      {
        id: "c1",
        name: "flow_designer",
        description: "Map the problem into an executable workflow.",
        source: "skill-library",
        skillId: "flow-designer"
      },
      {
        id: "c2",
        name: "capability_mapper",
        description: "Translate workflow stages into reusable capabilities.",
        source: "skill-library",
        skillId: "capability-mapper"
      },
      {
        id: "c3",
        name: "qa_check",
        description: "Review artifacts for gaps, bugs, and weak assumptions.",
        source: "skill-library",
        skillId: "qa-check"
      }
    ]
  },
  {
    problemId: "p_002",
    items: [
      {
        id: "c4",
        name: "flow_designer",
        description: "Map the problem into an executable workflow.",
        source: "skill-library",
        skillId: "flow-designer"
      },
      {
        id: "c5",
        name: "spec_writer",
        description: "Produce a build-ready implementation specification.",
        source: "skill-library",
        skillId: "spec-writer"
      }
    ]
  },
  {
    problemId: "p_003",
    items: [
      {
        id: "c6",
        name: "qa_check",
        description: "Review artifacts for gaps, bugs, and weak assumptions.",
        source: "skill-library",
        skillId: "qa-check"
      },
      {
        id: "c7",
        name: "ship_readiness",
        description: "Decide whether the current output is ready to ship.",
        source: "skill-library",
        skillId: "ship-readiness"
      }
    ]
  }
]
