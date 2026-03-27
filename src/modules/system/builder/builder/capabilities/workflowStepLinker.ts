import type { BuilderCapabilityDefinition, Workflow } from "../types/builder.ts"

type RunWorkflowStepLinkerInput = {
  problemId: string
  workflows: Workflow[]
  stepId: string
  capabilityId: string | null
}

export const workflowStepLinkerCapability: BuilderCapabilityDefinition = {
  name: "workflow_step_linker",
  purpose: "Link one workflow step to one attached capability.",
  input_schema: {
    problem_id: "string",
    workflows: "workflow[]",
    step_id: "string",
    capability_id: "string|null"
  },
  process_logic: [
    "resolve active workflow",
    "validate workflow step",
    "write step capability link",
    "return updated workflow collection"
  ],
  output_schema: {
    workflows: "workflow[]",
    workflow: "workflow",
    step_link_state: "linked|unlinked"
  },
  state: "idle|validating|updating|ready|error",
  trigger: "called when a step capability changes",
  error_handling: {
    workflow_missing: "create empty workflow",
    step_not_found: "return existing workflow state",
    invalid_link: "return error state"
  }
}

export function runWorkflowStepLinker({
  problemId,
  workflows,
  stepId,
  capabilityId
}: RunWorkflowStepLinkerInput): {
  workflows: Workflow[]
  workflow: Workflow
  stepLinkState: "linked" | "unlinked"
} {
  const existing =
    workflows.find((workflow) => workflow.problemId === problemId) ?? {
      problemId,
      steps: []
    }

  const nextWorkflow = {
    ...existing,
    steps: existing.steps.map((step) =>
      step.id === stepId ? { ...step, capabilityId: capabilityId || undefined } : step
    )
  }

  const rest = workflows.filter((workflow) => workflow.problemId !== problemId)

  return {
    workflows: [...rest, nextWorkflow],
    workflow: nextWorkflow,
    stepLinkState: capabilityId ? "linked" : "unlinked"
  }
}

export function detachCapabilityFromWorkflowSteps({
  problemId,
  workflows,
  capabilityId
}: {
  problemId: string
  workflows: Workflow[]
  capabilityId: string
}): {
  workflows: Workflow[]
  workflow: Workflow
} {
  const existing =
    workflows.find((workflow) => workflow.problemId === problemId) ?? {
      problemId,
      steps: []
    }

  const nextWorkflow = {
    ...existing,
    steps: existing.steps.map((step) =>
      step.capabilityId === capabilityId ? { ...step, capabilityId: undefined } : step
    )
  }

  const rest = workflows.filter((workflow) => workflow.problemId !== problemId)

  return {
    workflows: [...rest, nextWorkflow],
    workflow: nextWorkflow
  }
}


