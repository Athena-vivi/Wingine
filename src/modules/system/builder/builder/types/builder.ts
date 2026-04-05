export type ProblemFrequency = "low" | "medium" | "high"

export type OutputType = "plugin" | "web-tool" | "script" | "not-started"

export type OutputStatus = "draft" | "in-progress" | "testing" | "done"

export type Problem = {
  id: string
  title: string
  description: string
  source: string
  tag: string
  context?: string
  frequency?: ProblemFrequency
  cost?: string
}

export type WorkflowStep = {
  id: string
  text: string
  capabilityId?: string
}

export type Workflow = {
  problemId: string
  steps: WorkflowStep[]
}

export type Capability = {
  id: string
  name: string
  description?: string
  source?: "custom" | "skill-library"
  skillId?: string
}

export type CapabilitySet = {
  problemId: string
  items: Capability[]
}

export type Output = {
  problemId: string
  outputType: OutputType
  status: OutputStatus
  link?: string
  notes?: string
}

export type UITemplate = {
  id: string
  name: string
  description: string
  prompt: string
}

export type SkillModule = {
  id: string
  layer: "capability"
  group?: "core" | "secondary"
  input: Record<string, unknown>
  process: string[]
  output: Record<string, unknown>
  trigger: string
}

export type BuilderCapabilityDefinition = {
  name: string
  purpose: string
  input_schema: Record<string, string>
  process_logic: string[]
  output_schema: Record<string, string>
  state: string
  trigger: string
  error_handling: Record<string, string>
}

export type BuilderWorkspaceRecord = {
  problemId: string
  problem: Problem
  workflow: Workflow
  capabilitySet: CapabilitySet
  output: Output
  linkedCapabilities: Capability[]
  activeCapabilityIds: string[]
  template: UITemplate
}

export type BuilderCapabilityDetail = {
  capability: Capability | null
  status: "active" | "idle" | "missing"
  usedBySteps: string[]
  trigger: string
  process: string[]
  output: string[]
  role: string
}
