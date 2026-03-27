import { exportScoreObjectFromEvaluation } from "../../modules/capability/decision/scoring_module/adapters/scoreExportAdapter.ts"
import { importWorkflowObjectToScoringObject } from "../../modules/capability/decision/scoring_module/adapters/workflowImportAdapter.ts"
import { buildScoringToBettingRequest, evaluateScoringToBettingGate } from "../../modules/capability/decision/scoring_module/contracts/scoringToBetting.ts"
import type {
  ProtocolResponse,
  ScoreExportPayload,
  WorkflowImportPayload
} from "../../modules/capability/decision/scoring_module/types/protocol.ts"

export function runScoringWorkflowImportProtocol(
  payload: WorkflowImportPayload
): ProtocolResponse<Record<string, unknown>> {
  return {
    request_id: `workflow-import-${payload.workflow.id}`,
    capability: "workflow_import",
    status: "success",
    state: "ready",
    data: {
      object: importWorkflowObjectToScoringObject(payload.workflow),
      contract_response: {
        contract_name: "builder_to_scoring",
        accepted: Boolean(payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0),
        gate_result: payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0 ? "pass" : "reject",
        state_change:
          payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0
            ? {
                from: payload.workflow.status,
                to: payload.workflow.status
              }
            : null,
        references: {
          input_id: payload.workflow.id,
          output_id:
            payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0
              ? `score_${payload.workflow.id}`
              : null,
          output_type:
            payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0 ? "score" : null
        },
        message:
          payload.workflow.id && payload.workflow.problem_id && payload.workflow.steps.length > 0
            ? "workflow accepted into scoring"
            : "workflow rejected by scoring intake gate"
      }
    },
    error: null
  }
}

export function runScoringScoreExportProtocol(
  payload: ScoreExportPayload
): ProtocolResponse<Record<string, unknown>> {
  const score = exportScoreObjectFromEvaluation({
    evaluation: payload.evaluation,
    object: payload.object
  })

  return {
    request_id: `score-export-${payload.evaluation.id}`,
    capability: "score_export",
    status: "success",
    state: "ready",
    data: {
      score,
      contract_request: buildScoringToBettingRequest({
        evaluation: payload.evaluation,
        object: payload.object
      }),
      contract_response: evaluateScoringToBettingGate(score)
    },
    error: null
  }
}
