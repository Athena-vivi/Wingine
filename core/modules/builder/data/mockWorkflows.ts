import type { Workflow } from "../types/builder.ts"

export const mockWorkflows: Workflow[] = [
  {
    problemId: "p_001",
    steps: [
      { id: "w1", text: "Pull search term report data", capabilityId: "c1" },
      { id: "w2", text: "Filter high-spend terms", capabilityId: "c2" },
      { id: "w3", text: "Check conversion count", capabilityId: "c3" },
      { id: "w4", text: "Mark terms as negative, observe, or keep" }
    ]
  },
  {
    problemId: "p_002",
    steps: [
      { id: "w5", text: "Capture current competitor listing snapshot", capabilityId: "c4" },
      { id: "w6", text: "Compare title, bullets, and image changes", capabilityId: "c5" },
      { id: "w7", text: "Summarize material updates worth reviewing" }
    ]
  },
  {
    problemId: "p_003",
    steps: [
      { id: "w8", text: "Group repeated support questions by theme", capabilityId: "c6" },
      { id: "w9", text: "Draft reusable answer structure", capabilityId: "c7" },
      { id: "w10", text: "Prepare final response template for the team" }
    ]
  }
]


