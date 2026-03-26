import type { BuilderCapabilityDefinition, Workflow, WorkflowStep } from "@/types/builder"

type WorkflowMutation =
  | {
      action: "load"
      workflowId?: never
    }
  | {
      action: "create"
      step: WorkflowStep
    }
  | {
      action: "update"
      stepId: string
      text: string
    }
  | {
      action: "delete"
      stepId: string
    }
  | {
      action: "move"
      stepId: string
      direction: "up" | "down"
    }

type RunWorkflowManagerInput = {
  problemId: string
  workflows: Workflow[]
  mutation: WorkflowMutation
}

export const workflowManagerCapability: BuilderCapabilityDefinition = {
  name: "workflow_manager",
  purpose: "Create, update, delete, and reorder workflow steps for the active problem.",
  input_schema: {
    problem_id: "string",
    workflows: "workflow[]",
    action: "load|create|update|delete|move",
    step_id: "string",
    step_text: "string",
    direction: "up|down"
  },
  process_logic: [
    "load workflow by problem id",
    "apply requested mutation",
    "normalize step order",
    "return updated workflow collection"
  ],
  output_schema: {
    workflows: "workflow[]",
    workflow: "workflow"
  },
  state: "idle|loading|updating|ready|error",
  trigger: "called on workflow interaction",
  error_handling: {
    workflow_missing: "create empty workflow",
    step_not_found: "ignore invalid step mutation",
    invalid_action: "return existing workflow state"
  }
}

export function runWorkflowManager({ problemId, workflows, mutation }: RunWorkflowManagerInput): {
  workflows: Workflow[]
  workflow: Workflow
} {
  const existing =
    workflows.find((workflow) => workflow.problemId === problemId) ?? {
      problemId,
      steps: []
    }

  let nextWorkflow = existing

  switch (mutation.action) {
    case "load":
      nextWorkflow = existing
      break
    case "create":
      nextWorkflow = {
        ...existing,
        steps: [...existing.steps, mutation.step]
      }
      break
    case "update":
      nextWorkflow = {
        ...existing,
        steps: existing.steps.map((step) => (step.id === mutation.stepId ? { ...step, text: mutation.text } : step))
      }
      break
    case "delete":
      nextWorkflow = {
        ...existing,
        steps: existing.steps.filter((step) => step.id !== mutation.stepId)
      }
      break
    case "move": {
      const index = existing.steps.findIndex((step) => step.id === mutation.stepId)

      if (index < 0) {
        nextWorkflow = existing
        break
      }

      const targetIndex = mutation.direction === "up" ? index - 1 : index + 1

      if (targetIndex < 0 || targetIndex >= existing.steps.length) {
        nextWorkflow = existing
        break
      }

      const nextSteps = [...existing.steps]
      ;[nextSteps[index], nextSteps[targetIndex]] = [nextSteps[targetIndex], nextSteps[index]]
      nextWorkflow = {
        ...existing,
        steps: nextSteps
      }
      break
    }
  }

  const rest = workflows.filter((workflow) => workflow.problemId !== problemId)

  return {
    workflows: [...rest, nextWorkflow],
    workflow: nextWorkflow
  }
}
