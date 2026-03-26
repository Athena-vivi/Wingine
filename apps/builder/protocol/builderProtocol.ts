import { buildBuilderWorkspaceRecord } from "@/capabilities/builderRecordManager"
import { runCapabilityAttachmentManager } from "@/capabilities/capabilityAttachmentManager"
import { runOutputManager } from "@/capabilities/outputManager"
import { buildBuilderToScoringWorkflowRequest, evaluateBuilderToScoringGate } from "@/contracts/builderToScoring"
import { importBetFeedbackToBuilder } from "@/adapters/betFeedbackImportAdapter"
import { importProblemObjectToBuilderProblem } from "@/adapters/problemImportAdapter"
import { importScoreFeedbackToBuilder } from "@/adapters/scoreFeedbackImportAdapter"
import { applyBetFeedbackToBuilderState, applyScoringFeedbackToBuilderState } from "@/protocol/builderStateStore"
import { exportWorkflowObjectFromBuilderWorkflow } from "@/adapters/workflowExportAdapter"
import { evaluateRadarToBuilderGate } from "@/contracts/radarToBuilder"
import { resolveUITemplate } from "@/capabilities/uiTemplateManager"
import { runWorkflowManager } from "@/capabilities/workflowManager"
import { detachCapabilityFromWorkflowSteps, runWorkflowStepLinker } from "@/capabilities/workflowStepLinker"
import type {
  BuilderProtocolRequest,
  BuilderProtocolResponse,
  BuilderWorkspacePayload,
  BettingFeedbackImportPayload,
  ProblemImportPayload,
  ScoringFeedbackImportPayload,
  WorkflowExportPayload
} from "@/types/protocol"

type BuilderLoadPayload = BuilderWorkspacePayload

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

export async function runBuilderProtocol(request: BuilderProtocolRequest): Promise<BuilderProtocolResponse<Record<string, unknown>>> {
  try {
    switch (request.capability) {
      case "builder_load": {
        const payload = request.payload as BuilderLoadPayload
        const template = resolveUITemplate({
          templateId: payload.templates[0]?.id ?? "",
          templates: payload.templates
        }).template
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            builder_record: buildBuilderWorkspaceRecord({
              problemId: payload.problem_id,
              problems: payload.problems,
              workflows: payload.workflows,
              capabilitySets: payload.capability_sets,
              outputs: payload.outputs,
              template
            })
          },
          error: null
        }
      }
      case "workflow_update": {
        const payload = request.payload as WorkflowUpdatePayload
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runWorkflowManager({
            problemId: payload.problem_id,
            workflows: payload.workflows,
            mutation: payload.mutation
          }),
          error: null
        }
      }
      case "workflow_link_update": {
        const payload = request.payload as WorkflowLinkUpdatePayload
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runWorkflowStepLinker({
            problemId: payload.problem_id,
            workflows: payload.workflows,
            stepId: payload.step_id,
            capabilityId: payload.capability_id
          }),
          error: null
        }
      }
      case "capability_attachment_update": {
        const payload = request.payload as CapabilityAttachmentUpdatePayload
        const workflowResult =
          payload.mutation.action === "delete_custom"
            ? detachCapabilityFromWorkflowSteps({
                problemId: payload.problem_id,
                workflows: payload.workflows,
                capabilityId: payload.mutation.capabilityId
              })
            : { workflows: payload.workflows }

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            ...runCapabilityAttachmentManager({
              problemId: payload.problem_id,
              capabilitySets: payload.capability_sets,
              mutation: payload.mutation
            }),
            workflows: workflowResult.workflows
          },
          error: null
        }
      }
      case "output_update": {
        const payload = request.payload as OutputUpdatePayload
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: runOutputManager({
            problemId: payload.problem_id,
            outputs: payload.outputs,
            workflow: payload.workflow,
            capabilitySet: payload.capability_set,
            mutation: {
              action: "update",
              field: payload.field,
              value: payload.value
            }
          }),
          error: null
        }
      }
      case "builder_persist": {
        const payload = request.payload as BuilderPersistPayload
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            builder_record: payload.builder_record,
            persisted: true
          },
          error: null
        }
      }
      case "problem_import": {
        const payload = request.payload as ProblemImportPayload
        const importedProblem = importProblemObjectToBuilderProblem(payload.problem)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            problem: importedProblem,
            contract_response: evaluateRadarToBuilderGate(payload.problem)
          },
          error: null
        }
      }
      case "workflow_export": {
        const payload = request.payload as WorkflowExportPayload
        const workflowObject = exportWorkflowObjectFromBuilderWorkflow({
          workflow: payload.workflow,
          problem: payload.problem
        })

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            workflow: workflowObject,
            contract_request: buildBuilderToScoringWorkflowRequest({
              workflow: payload.workflow,
              problem: payload.problem
            }),
            contract_response: evaluateBuilderToScoringGate(workflowObject)
          },
          error: null
        }
      }
      case "scoring_to_builder_feedback": {
        const payload = request.payload as ScoringFeedbackImportPayload
        const feedback = importScoreFeedbackToBuilder(payload.score)
        const applied = await applyScoringFeedbackToBuilderState(feedback)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            feedback,
            applied_state: applied
          },
          error: null
        }
      }
      case "betting_to_builder_feedback": {
        const payload = request.payload as BettingFeedbackImportPayload
        const feedback = importBetFeedbackToBuilder(payload.bet)
        const applied = await applyBetFeedbackToBuilderState(feedback)

        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "success",
          state: "ready",
          data: {
            feedback,
            applied_state: applied
          },
          error: null
        }
      }
      default:
        return {
          request_id: request.request_id,
          capability: request.capability,
          status: "error",
          state: "error",
          data: null,
          error: {
            code: "protocol_not_found",
            message: `Unknown builder protocol: ${request.capability}`
          }
        }
    }
  } catch (error) {
    return {
      request_id: request.request_id,
      capability: request.capability,
      status: "error",
      state: "error",
      data: null,
      error: {
        code: "protocol_invocation_failed",
        message: error instanceof Error ? error.message : "Builder protocol invocation failed."
      }
    }
  }
}
