import type {
  BuilderCapabilityDefinition,
  BuilderWorkspaceRecord,
  CapabilitySet,
  Output,
  Problem,
  UITemplate,
  Workflow
} from "@/types/builder"

type BuildBuilderRecordInput = {
  problemId: string
  problems: Problem[]
  workflows: Workflow[]
  capabilitySets: CapabilitySet[]
  outputs: Output[]
  template: UITemplate
}

export const builderRecordManagerCapability: BuilderCapabilityDefinition = {
  name: "builder_record_manager",
  purpose: "Create and normalize the active builder workspace record from problem, workflow, capability, output, and template inputs.",
  input_schema: {
    problem_id: "string",
    problems: "problem[]",
    workflows: "workflow[]",
    capability_sets: "capability_set[]",
    outputs: "output[]",
    template: "ui_template"
  },
  process_logic: [
    "resolve active problem by problem id",
    "resolve workflow for active problem",
    "resolve capability set for active problem",
    "resolve output record for active problem",
    "resolve linked capabilities from workflow step capability links",
    "resolve active capability ids",
    "return normalized builder workspace record"
  ],
  output_schema: {
    builder_record: "builder_workspace_record"
  },
  state: "idle|loading|ready|error",
  trigger: "called when builder workspace loads or the selected problem changes",
  error_handling: {
    problem_missing: "fallback to first available problem",
    workflow_missing: "return empty workflow",
    capability_set_missing: "return empty capability set",
    output_missing: "return default output state"
  }
}

export function buildBuilderWorkspaceRecord({
  problemId,
  problems,
  workflows,
  capabilitySets,
  outputs,
  template
}: BuildBuilderRecordInput): BuilderWorkspaceRecord {
  const selectedProblem = problems.find((problem) => problem.id === problemId) ?? problems[0]

  const selectedWorkflow =
    workflows.find((workflow) => workflow.problemId === selectedProblem.id) ?? {
      problemId: selectedProblem.id,
      steps: []
    }

  const selectedCapabilitySet =
    capabilitySets.find((set) => set.problemId === selectedProblem.id) ?? {
      problemId: selectedProblem.id,
      items: []
    }

  const selectedOutput =
    outputs.find((output) => output.problemId === selectedProblem.id) ?? {
      problemId: selectedProblem.id,
      outputType: "not-started",
      status: "draft",
      link: "",
      notes: ""
    }

  const linkedCapabilities = selectedCapabilitySet.items.filter((item) =>
    selectedWorkflow.steps.some((step) => step.capabilityId === item.id)
  )

  return {
    problemId: selectedProblem.id,
    problem: selectedProblem,
    workflow: selectedWorkflow,
    capabilitySet: selectedCapabilitySet,
    output: selectedOutput,
    linkedCapabilities,
    activeCapabilityIds: linkedCapabilities.map((item) => item.id),
    template
  }
}
