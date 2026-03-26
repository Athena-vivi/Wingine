import type { FlowRequest, FlowResponse, WorkflowObject } from "../../../packages/shared"
import { exportWorkflowObjectFromBuilderWorkflow } from "@/adapters/workflowExportAdapter"
import type { Problem, Workflow } from "@/types/builder"

export function buildBuilderToScoringWorkflowRequest({
  workflow,
  problem
}: {
  workflow: Workflow
  problem: Problem
}): FlowRequest<WorkflowObject> {
  const workflowObject = exportWorkflowObjectFromBuilderWorkflow({ workflow, problem })

  return {
    contract_name: "builder_to_scoring",
    producer: "builder",
    consumer: "scoring",
    object: workflowObject,
    context: {
      request_id: `builder-to-scoring-${workflowObject.id}`,
      trigger: "workflow_ready_for_scoring",
      sent_at: new Date().toISOString()
    }
  }
}

export function evaluateBuilderToScoringGate(workflow: WorkflowObject): FlowResponse {
  const accepted = Boolean(
    workflow.id &&
      workflow.problem_id &&
      workflow.steps.length > 0 &&
      workflow.status !== "retired"
  )

  return {
    contract_name: "builder_to_scoring",
    accepted,
    gate_result: accepted ? "pass" : "reject",
    state_change: accepted
      ? {
          from: workflow.status,
          to: workflow.status
        }
      : null,
    references: {
      input_id: workflow.id,
      output_id: accepted ? `score_${workflow.id}` : null,
      output_type: accepted ? "score" : null
    },
    message: accepted ? "workflow accepted for scoring" : "workflow rejected by scoring intake gate"
  }
}
