import type {
  BuilderCapabilityDefinition,
  Capability,
  CapabilitySet,
  Output,
  Workflow
} from "../types/builder.ts"

type OutputMutation =
  | { action: "load" }
  | { action: "update"; field: keyof Output; value: Output[keyof Output] }

type RunOutputManagerInput = {
  problemId: string
  outputs: Output[]
  workflow: Workflow
  capabilitySet: CapabilitySet
  mutation: OutputMutation
}

const createDefaultOutput = (problemId: string): Output => ({
  problemId,
  outputType: "not-started",
  status: "draft",
  link: "",
  notes: ""
})

export const outputManagerCapability: BuilderCapabilityDefinition = {
  name: "output_manager",
  purpose: "Create, update, and normalize output state for the active problem.",
  input_schema: {
    problem_id: "string",
    outputs: "output[]",
    workflow: "workflow",
    capability_set: "capability_set",
    action: "load|update",
    field: "problemId|outputType|status|link|notes",
    value: "unknown"
  },
  process_logic: [
    "load output record by problem id",
    "apply output mutation when requested",
    "resolve active capability dependencies from workflow step links",
    "return updated output state and dependency summary"
  ],
  output_schema: {
    outputs: "output[]",
    output: "output",
    depends_on: "capability[]"
  },
  state: "idle|loading|updating|ready|error",
  trigger: "called on output update or workflow capability link change",
  error_handling: {
    output_missing: "create default output state",
    invalid_status: "ignore invalid update",
    invalid_output_type: "ignore invalid update"
  }
}

export function runOutputManager({
  problemId,
  outputs,
  workflow,
  capabilitySet,
  mutation
}: RunOutputManagerInput): {
  outputs: Output[]
  output: Output
  dependsOn: Capability[]
} {
  const existing = outputs.find((item) => item.problemId === problemId) ?? createDefaultOutput(problemId)

  const nextOutput =
    mutation.action === "update"
      ? {
          ...existing,
          [mutation.field]: mutation.value
        }
      : existing

  const rest = outputs.filter((item) => item.problemId !== problemId)
  const dependsOn = capabilitySet.items.filter((item) => workflow.steps.some((step) => step.capabilityId === item.id))

  return {
    outputs: [...rest, nextOutput],
    output: nextOutput,
    dependsOn
  }
}


