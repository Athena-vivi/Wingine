import type { WorkflowObject } from "../../SharedContracts"
import type { ScoringObject } from "@/types/scoring"

export function importWorkflowObjectToScoringObject(workflow: WorkflowObject): ScoringObject {
  return {
    id: workflow.id,
    type: "workflow",
    title: workflow.name || `Workflow ${workflow.id}`,
    summary: workflow.summary || `${workflow.steps.length} steps`,
    status: workflow.status,
    source: workflow.source.system,
    metadata: {
      problem_id: workflow.problem_id,
      step_count: workflow.steps.length,
      linked_step_count: workflow.steps.filter((step) => step.module_id).length,
      ...workflow.metadata.custom
    }
  }
}
