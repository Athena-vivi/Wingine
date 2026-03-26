import { invokeConfidenceResolver } from "@/capabilities/confidenceResolver"
import { invokeDimensionScoreManager } from "@/capabilities/dimensionScoreManager"
import { exportScoreObjectFromEvaluation } from "@/adapters/scoreExportAdapter"
import {
  invokeEvaluationRecordLoad,
  invokeEvaluationRecordPersist,
  loadPersistedEvaluationRecordState
} from "@/capabilities/evaluationRecordManager"
import { invokeEvaluationHistoryManager } from "@/capabilities/evaluationHistoryManager"
import { invokeGateResolver } from "@/capabilities/gateResolver"
import { invokeObjectContextLoader } from "@/capabilities/objectContextLoader"
import { invokeRoleInputManager } from "@/capabilities/roleInputManager"
import { invokeScoreAggregator } from "@/capabilities/scoreAggregator"
import { invokeTypeProfileResolver } from "@/capabilities/typeProfileResolver"
import { buildScoringToBettingRequest, evaluateScoringToBettingGate } from "@/contracts/scoringToBetting"
import { importWorkflowObjectToScoringObject } from "@/adapters/workflowImportAdapter"
import { scoringObjects } from "@/data/scoringObjects"
import type {
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolCaller,
  ProtocolRequest,
  ProtocolResponse,
  ScoreExportPayload,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload,
  WorkflowImportPayload
} from "@/types/protocol"
import type { EvaluationRecord, ScoringObject } from "@/types/scoring"

const defaultCaller: ProtocolCaller = {
  type: "human-ui",
  id: "scoring-interface"
}

function createRequest<TPayload>(
  capability: string,
  payload: TPayload,
  context: ProtocolRequest<TPayload>["context"]
): ProtocolRequest<TPayload> {
  return {
    request_id: `${capability}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    capability,
    caller: defaultCaller,
    payload,
    context
  }
}

function buildWorkspaceState(
  currentObject: ScoringObject,
  evaluations: Record<string, EvaluationRecord>,
  selectedObjectId: string
): ProtocolResponse<ScoringWorkspaceState> {
  const objectResponse = invokeObjectContextLoader(
    createRequest(
      "object_context_loader",
      {
        object_id: currentObject.id,
        object_type: currentObject.type
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type
      }
    )
  )

  const profileResponse = invokeTypeProfileResolver(
    createRequest(
      "type_profile_resolver",
      {
        object_type: currentObject.type
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type
      }
    )
  )

  const historyResponse = invokeEvaluationHistoryManager(
    createRequest(
      "evaluation_history_manager",
      {
        object_id: currentObject.id
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type
      }
    )
  )

  if (objectResponse.status === "error" || profileResponse.status === "error" || historyResponse.status === "error") {
    return {
      request_id: `workspace-${currentObject.id}`,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error:
        objectResponse.error ??
        profileResponse.error ??
        historyResponse.error ?? {
          code: "workspace_error",
          message: "failed to build workspace"
        }
    }
  }

  return {
    request_id: `workspace-${currentObject.id}`,
    capability: "scoring_workspace",
    status: "success",
    state: "ready",
    data: {
      selectedObjectId,
      objects: scoringObjects,
      currentObject: objectResponse.data!.object,
      profile: profileResponse.data!.profile,
      evaluation: evaluations[currentObject.id],
      history: historyResponse.data!.history,
      evaluations
    },
    error: null
  }
}

export function protocolLoadWorkspace(
  payload: LoadWorkspacePayload
): ProtocolResponse<ScoringWorkspaceState> {
  const persisted = loadPersistedEvaluationRecordState()
  const selectedObjectId =
    payload.selectedObjectId ||
    persisted?.selectedObjectId ||
    scoringObjects[0]?.id ||
    ""

  const loadResponse = invokeEvaluationRecordLoad(
    createRequest(
      "evaluation_record_manager",
      {
        selected_object_id: selectedObjectId,
        evaluations: payload.evaluations ?? persisted?.evaluations
      },
      {
        objectId: selectedObjectId
      }
    )
  )

  if (loadResponse.status === "error") {
    return {
      request_id: loadResponse.request_id,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: loadResponse.error
    }
  }

  const currentObject = scoringObjects.find((object) => object.id === loadResponse.data!.selected_object_id) ?? scoringObjects[0]

  return buildWorkspaceState(currentObject, loadResponse.data!.evaluations, loadResponse.data!.selected_object_id)
}

export function protocolUpdateDimension(
  payload: UpdateDimensionPayload
): ProtocolResponse<ScoringWorkspaceState> {
  const currentObject = scoringObjects.find((object) => object.id === payload.selectedObjectId) ?? scoringObjects[0]
  const currentEvaluation = payload.evaluations[currentObject.id]

  const dimensionResponse = invokeDimensionScoreManager(
    createRequest(
      "dimension_score_manager",
      {
        evaluation: currentEvaluation,
        dimension: payload.dimension,
        field: payload.field,
        value: payload.value
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type,
        evaluationId: currentEvaluation.id
      }
    )
  )

  if (dimensionResponse.status === "error") {
    return {
      request_id: dimensionResponse.request_id,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: dimensionResponse.error
    }
  }

  const nextEvaluation = dimensionResponse.data!.evaluation
  const aggregateResponse = invokeScoreAggregator(
    createRequest(
      "score_aggregator",
      {
        object_type: currentObject.type,
        dimensions: nextEvaluation.dimensions
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type,
        evaluationId: currentEvaluation.id
      }
    )
  )
  const confidenceResponse = invokeConfidenceResolver(
    createRequest(
      "confidence_resolver",
      {
        dimensions: nextEvaluation.dimensions
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type,
        evaluationId: currentEvaluation.id
      }
    )
  )

  if (aggregateResponse.status === "error" || confidenceResponse.status === "error") {
    return {
      request_id: `update-${currentObject.id}`,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: aggregateResponse.error ?? confidenceResponse.error
    }
  }

  const gateResponse = invokeGateResolver(
    createRequest(
      "gate_resolver",
      {
        weighted_score: aggregateResponse.data!.weighted_score,
        confidence: confidenceResponse.data!.confidence,
        dimensions: nextEvaluation.dimensions
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type,
        evaluationId: currentEvaluation.id
      }
    )
  )

  if (gateResponse.status === "error") {
    return {
      request_id: gateResponse.request_id,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: gateResponse.error
    }
  }

  const nextEvaluations = {
    ...payload.evaluations,
    [currentObject.id]: {
      ...nextEvaluation,
      aggregate: {
        weightedScore: aggregateResponse.data!.weighted_score,
        dimensionAverage: aggregateResponse.data!.dimension_average,
        confidence: confidenceResponse.data!.confidence,
        gateResult: gateResponse.data!.result
      }
    }
  }

  return buildWorkspaceState(currentObject, nextEvaluations, payload.selectedObjectId)
}

export function protocolUpdateRoleInput(
  payload: UpdateRolePayload
): ProtocolResponse<ScoringWorkspaceState> {
  const currentObject = scoringObjects.find((object) => object.id === payload.selectedObjectId) ?? scoringObjects[0]
  const currentEvaluation = payload.evaluations[currentObject.id]

  const roleResponse = invokeRoleInputManager(
    createRequest(
      "role_input_manager",
      {
        evaluation: currentEvaluation,
        role: payload.role,
        field: payload.field,
        value: payload.value
      },
      {
        objectId: currentObject.id,
        objectType: currentObject.type,
        evaluationId: currentEvaluation.id
      }
    )
  )

  if (roleResponse.status === "error") {
    return {
      request_id: roleResponse.request_id,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: roleResponse.error
    }
  }

  const nextEvaluations = {
    ...payload.evaluations,
    [currentObject.id]: roleResponse.data!.evaluation
  }

  return buildWorkspaceState(currentObject, nextEvaluations, payload.selectedObjectId)
}

export function protocolPersistWorkspace(
  payload: PersistWorkspacePayload
): ProtocolResponse<{ saved: boolean }> {
  return invokeEvaluationRecordPersist(
    createRequest("evaluation_record_manager", payload, {
      objectId: payload.selectedObjectId
    })
  )
}

export function protocolWorkflowImport(
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

export function protocolScoreExport(
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
