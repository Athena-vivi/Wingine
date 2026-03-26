import type { WorkflowStatus } from "../enums/statuses"
import type { SharedObjectBase } from "./base"

export type WorkflowStepRef = {
  id: string
  text: string
  module_id: string | null
  status: "executable" | "blocked"
}

export type WorkflowObject = SharedObjectBase<"workflow", WorkflowStatus> & {
  name?: string
  summary?: string
  problem_id: string
  steps: WorkflowStepRef[]
}
