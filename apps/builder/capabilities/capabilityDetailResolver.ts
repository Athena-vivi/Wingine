import { skillModulesById } from "@/data/skills"
import type { BuilderCapabilityDefinition, BuilderCapabilityDetail, Capability, WorkflowStep } from "@/types/builder"

export const capabilityDetailResolverCapability: BuilderCapabilityDefinition = {
  name: "capability_detail_resolver",
  purpose: "Resolve the internal definition of one capability asset for display or downstream use.",
  input_schema: {
    capability_id: "string",
    capabilities: "capability[]",
    workflow_steps: "workflow_step[]"
  },
  process_logic: [
    "resolve capability definition",
    "resolve used-by workflow steps",
    "resolve trigger process output",
    "return capability detail block"
  ],
  output_schema: {
    capability_detail: "capability_detail"
  },
  state: "idle|loading|ready|error",
  trigger: "called when capability detail is requested",
  error_handling: {
    capability_not_found: "return null detail",
    detail_missing: "return partial detail"
  }
}

export function resolveCapabilityDetail({
  capabilityId,
  capabilities,
  workflowSteps
}: {
  capabilityId: string | null
  capabilities: Capability[]
  workflowSteps: WorkflowStep[]
}): BuilderCapabilityDetail {
  const capability = capabilities.find((item) => item.id === capabilityId) ?? null

  if (!capability) {
    return {
      capability: null,
      status: "missing",
      usedBySteps: [],
      trigger: "",
      process: [],
      output: [],
      role: ""
    }
  }

  const usedBySteps = workflowSteps
    .filter((step) => step.capabilityId === capability.id)
    .map((step, index) => step.text || `Step ${index + 1}`)

  const skillModule = capability.skillId ? skillModulesById[capability.skillId] : undefined
  const outputKeys = skillModule ? Object.keys(skillModule.output) : []

  return {
    capability,
    status: usedBySteps.length > 0 ? "active" : "idle",
    usedBySteps,
    trigger: skillModule?.trigger ?? "",
    process: skillModule?.process ?? [],
    output: outputKeys,
    role: capability.description || capability.name
  }
}
