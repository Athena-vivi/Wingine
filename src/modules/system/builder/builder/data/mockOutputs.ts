import type { Output } from "../types/builder.ts"

export const mockOutputs: Output[] = [
  {
    problemId: "p_001",
    outputType: "plugin",
    status: "in-progress",
    link: "",
    notes: "MVP side panel already started."
  },
  {
    problemId: "p_002",
    outputType: "web-tool",
    status: "draft",
    link: "",
    notes: "Need a lightweight diff view before coding."
  },
  {
    problemId: "p_003",
    outputType: "script",
    status: "testing",
    link: "",
    notes: "Validating answer quality with real support threads."
  }
]


