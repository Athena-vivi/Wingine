import type { WorkflowObject, WorkflowStatus } from "../../shared/index.ts"
import type { Problem, Workflow } from "../types/builder.ts"

function resolveWorkflowStatus(workflow: Workflow): WorkflowStatus {
  if (workflow.steps.length === 0) {
    return "draft"
  }

  if (workflow.steps.every((step) => step.capabilityId)) {
    return "executable"
  }

  if (workflow.steps.some((step) => step.capabilityId)) {
    return "mapped"
  }

  return "blocked"
}

export function exportWorkflowObjectFromBuilderWorkflow({
  workflow,
  problem
}: {
  workflow: Workflow
  problem: Problem
}): WorkflowObject {
  const timestamp = new Date().toISOString()
  const status = resolveWorkflowStatus(workflow)

  return {
    id: `workflow_${workflow.problemId}`,
    type: "workflow",
    source: {
      system: "builder",
      origin_id: workflow.problemId,
      origin_ref: workflow.problemId
    },
    status,
    metadata: {
      tags: [problem.tag].filter(Boolean).map((value) => value.toLowerCase()),
      labels: [problem.source].filter(Boolean),
      custom: {
        step_count: workflow.steps.length,
        linked_step_count: workflow.steps.filter((step) => step.capabilityId).length
      }
    },
    timestamps: {
      created_at: timestamp,
      updated_at: timestamp,
      observed_at: timestamp
    },
    name: problem.title,
    summary: problem.description,
    problem_id: workflow.problemId,
    steps: workflow.steps.map((step) => ({
      id: step.id,
      text: step.text,
      module_id: step.capabilityId ?? null,
      status: step.capabilityId ? "executable" : "blocked"
    }))
  }
}


