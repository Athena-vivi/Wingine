import { buildBuilderWorkspaceRecord } from "../../modules/system/builder/builder/capabilities/builderRecordManager.ts"
import { runCapabilityAttachmentManager } from "../../modules/system/builder/builder/capabilities/capabilityAttachmentManager.ts"
import { runOutputManager } from "../../modules/system/builder/builder/capabilities/outputManager.ts"
import { resolveUITemplate } from "../../modules/system/builder/builder/capabilities/uiTemplateManager.ts"
import { runWorkflowManager } from "../../modules/system/builder/builder/capabilities/workflowManager.ts"
import { detachCapabilityFromWorkflowSteps, runWorkflowStepLinker } from "../../modules/system/builder/builder/capabilities/workflowStepLinker.ts"
import { shouldDetachCapabilityOnMutation } from "../../control/policy/builderPolicy.ts"
import type {
  BuilderProtocolName,
  BuilderProtocolResponse,
  BuilderWorkspacePayload
} from "../../modules/system/builder/builder/types/protocol.ts"

type WorkflowUpdatePayload = {
  problem_id: string
  workflows: BuilderWorkspacePayload["workflows"]
  mutation: Parameters<typeof runWorkflowManager>[0]["mutation"]
}

type WorkflowLinkUpdatePayload = {
  problem_id: string
  workflows: BuilderWorkspacePayload["workflows"]
  step_id: string
  capability_id: string | null
}

type CapabilityAttachmentUpdatePayload = {
  problem_id: string
  capability_sets: BuilderWorkspacePayload["capability_sets"]
  workflows: BuilderWorkspacePayload["workflows"]
  mutation: Parameters<typeof runCapabilityAttachmentManager>[0]["mutation"]
}

type OutputUpdatePayload = {
  problem_id: string
  outputs: BuilderWorkspacePayload["outputs"]
  workflow: BuilderWorkspacePayload["workflows"][number]
  capability_set: BuilderWorkspacePayload["capability_sets"][number]
  field: keyof BuilderWorkspacePayload["outputs"][number]
  value: BuilderWorkspacePayload["outputs"][number][keyof BuilderWorkspacePayload["outputs"][number]]
}

type BuilderPersistPayload = {
  builder_record: ReturnType<typeof buildBuilderWorkspaceRecord>
}

export function runBuilderLoadWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: BuilderWorkspacePayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  const template = resolveUITemplate({
    templateId: input.payload.templates[0]?.id ?? "",
    templates: input.payload.templates
  }).template

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      builder_record: buildBuilderWorkspaceRecord({
        problemId: input.payload.problem_id,
        problems: input.payload.problems,
        workflows: input.payload.workflows,
        capabilitySets: input.payload.capability_sets,
        outputs: input.payload.outputs,
        template
      })
    },
    error: null
  }
}

export function runBuilderWorkflowUpdateWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: WorkflowUpdatePayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: runWorkflowManager({
      problemId: input.payload.problem_id,
      workflows: input.payload.workflows,
      mutation: input.payload.mutation
    }),
    error: null
  }
}

export function runBuilderWorkflowLinkWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: WorkflowLinkUpdatePayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: runWorkflowStepLinker({
      problemId: input.payload.problem_id,
      workflows: input.payload.workflows,
      stepId: input.payload.step_id,
      capabilityId: input.payload.capability_id
    }),
    error: null
  }
}

export function runBuilderCapabilityAttachmentWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: CapabilityAttachmentUpdatePayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  const workflowResult =
    shouldDetachCapabilityOnMutation(input.payload.mutation.action)
      ? detachCapabilityFromWorkflowSteps({
          problemId: input.payload.problem_id,
          workflows: input.payload.workflows,
          capabilityId: "capabilityId" in input.payload.mutation ? input.payload.mutation.capabilityId : ""
        })
      : { workflows: input.payload.workflows }

  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      ...runCapabilityAttachmentManager({
        problemId: input.payload.problem_id,
        capabilitySets: input.payload.capability_sets,
        mutation: input.payload.mutation
      }),
      workflows: workflowResult.workflows
    },
    error: null
  }
}

export function runBuilderOutputUpdateWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: OutputUpdatePayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: runOutputManager({
      problemId: input.payload.problem_id,
      outputs: input.payload.outputs,
      workflow: input.payload.workflow,
      capabilitySet: input.payload.capability_set,
      mutation: {
        action: "update",
        field: input.payload.field,
        value: input.payload.value
      }
    }),
    error: null
  }
}

export function runBuilderPersistWorkflow(input: {
  requestId: string
  capability: BuilderProtocolName
  payload: BuilderPersistPayload
}): BuilderProtocolResponse<Record<string, unknown>> {
  return {
    request_id: input.requestId,
    capability: input.capability,
    status: "success",
    state: "ready",
    data: {
      builder_record: input.payload.builder_record,
      persisted: true
    },
    error: null
  }
}
