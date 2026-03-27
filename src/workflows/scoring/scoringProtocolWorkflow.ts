import { invokeDimensionScoreManager } from "../../modules/capability/decision/scoring_module/capabilities/dimensionScoreManager.ts"
import {
  invokeEvaluationRecordLoad,
  invokeEvaluationRecordPersist,
  loadPersistedEvaluationRecordState
} from "../../modules/capability/decision/scoring_module/capabilities/evaluationRecordManager.ts"
import { invokeEvaluationHistoryManager } from "../../modules/capability/decision/scoring_module/capabilities/evaluationHistoryManager.ts"
import { invokeObjectContextLoader } from "../../modules/capability/decision/scoring_module/capabilities/objectContextLoader.ts"
import { invokeRoleInputManager } from "../../modules/capability/decision/scoring_module/capabilities/roleInputManager.ts"
import { invokeTypeProfileResolver } from "../../modules/capability/decision/scoring_module/capabilities/typeProfileResolver.ts"
import { evaluateBuildScore } from "../../modules/capability/decision/buildDecision.ts"
import { scoringObjects } from "../../modules/capability/decision/scoring_module/data/scoringObjects.ts"
import type {
  LoadWorkspacePayload,
  PersistWorkspacePayload,
  ProtocolRequest,
  ProtocolResponse,
  ScoringWorkspaceState,
  UpdateDimensionPayload,
  UpdateRolePayload
} from "../../modules/capability/decision/scoring_module/types/protocol.ts"
import type { EvaluationRecord, ScoringObject } from "../../modules/capability/decision/scoring_module/types/scoring.ts"

type CreateRequest = <TPayload>(
  capability: string,
  payload: TPayload,
  context: ProtocolRequest<TPayload>["context"]
) => ProtocolRequest<TPayload>

export function buildScoringWorkspaceState(input: {
  createRequest: CreateRequest
  currentObject: ScoringObject
  evaluations: Record<string, EvaluationRecord>
  selectedObjectId: string
}): ProtocolResponse<ScoringWorkspaceState> {
  const objectResponse = invokeObjectContextLoader(
    input.createRequest(
      "object_context_loader",
      {
        object_id: input.currentObject.id,
        object_type: input.currentObject.type
      },
      {
        objectId: input.currentObject.id,
        objectType: input.currentObject.type
      }
    )
  )

  const profileResponse = invokeTypeProfileResolver(
    input.createRequest(
      "type_profile_resolver",
      {
        object_type: input.currentObject.type
      },
      {
        objectId: input.currentObject.id,
        objectType: input.currentObject.type
      }
    )
  )

  const historyResponse = invokeEvaluationHistoryManager(
    input.createRequest(
      "evaluation_history_manager",
      {
        object_id: input.currentObject.id
      },
      {
        objectId: input.currentObject.id,
        objectType: input.currentObject.type
      }
    )
  )

  if (objectResponse.status === "error" || profileResponse.status === "error" || historyResponse.status === "error") {
    return {
      request_id: `workspace-${input.currentObject.id}`,
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
    request_id: `workspace-${input.currentObject.id}`,
    capability: "scoring_workspace",
    status: "success",
    state: "ready",
    data: {
      selectedObjectId: input.selectedObjectId,
      objects: scoringObjects,
      currentObject: objectResponse.data!.object,
      profile: profileResponse.data!.profile,
      evaluation: input.evaluations[input.currentObject.id],
      history: historyResponse.data!.history,
      evaluations: input.evaluations
    },
    error: null
  }
}

export function runScoringLoadWorkspaceWorkflow(input: {
  payload: LoadWorkspacePayload
  createRequest: CreateRequest
}): ProtocolResponse<ScoringWorkspaceState> {
  const persisted = loadPersistedEvaluationRecordState()
  const selectedObjectId =
    input.payload.selectedObjectId ||
    persisted?.selectedObjectId ||
    scoringObjects[0]?.id ||
    ""

  const loadResponse = invokeEvaluationRecordLoad(
    input.createRequest(
      "evaluation_record_manager",
      {
        selected_object_id: selectedObjectId,
        evaluations: input.payload.evaluations ?? persisted?.evaluations
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

  return buildScoringWorkspaceState({
    createRequest: input.createRequest,
    currentObject,
    evaluations: loadResponse.data!.evaluations,
    selectedObjectId: loadResponse.data!.selected_object_id
  })
}

export function runScoringUpdateDimensionWorkflow(input: {
  payload: UpdateDimensionPayload
  createRequest: CreateRequest
}): ProtocolResponse<ScoringWorkspaceState> {
  const currentObject = scoringObjects.find((object) => object.id === input.payload.selectedObjectId) ?? scoringObjects[0]
  const currentEvaluation = input.payload.evaluations[currentObject.id]

  const dimensionResponse = invokeDimensionScoreManager(
    input.createRequest(
      "dimension_score_manager",
      {
        evaluation: currentEvaluation,
        dimension: input.payload.dimension,
        field: input.payload.field,
        value: input.payload.value
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
  const buildScoreDecision = evaluateBuildScore({
    createRequest: input.createRequest,
    requestContext: {
      objectId: currentObject.id,
      objectType: currentObject.type,
      evaluationId: currentEvaluation.id
    },
    objectType: currentObject.type,
    dimensions: nextEvaluation.dimensions
  })

  if (buildScoreDecision.status === "error") {
    return {
      request_id: buildScoreDecision.request_id,
      capability: "scoring_workspace",
      status: "error",
      state: "error",
      data: null,
      error: buildScoreDecision.error
    }
  }

  const nextEvaluations = {
    ...input.payload.evaluations,
    [currentObject.id]: {
      ...nextEvaluation,
      aggregate: {
        weightedScore: buildScoreDecision.data.weighted_score,
        dimensionAverage: buildScoreDecision.data.dimension_average,
        confidence: buildScoreDecision.data.confidence,
        gateResult: buildScoreDecision.data.gate_result
      }
    }
  }

  return buildScoringWorkspaceState({
    createRequest: input.createRequest,
    currentObject,
    evaluations: nextEvaluations,
    selectedObjectId: input.payload.selectedObjectId
  })
}

export function runScoringUpdateRoleWorkflow(input: {
  payload: UpdateRolePayload
  createRequest: CreateRequest
}): ProtocolResponse<ScoringWorkspaceState> {
  const currentObject = scoringObjects.find((object) => object.id === input.payload.selectedObjectId) ?? scoringObjects[0]
  const currentEvaluation = input.payload.evaluations[currentObject.id]

  const roleResponse = invokeRoleInputManager(
    input.createRequest(
      "role_input_manager",
      {
        evaluation: currentEvaluation,
        role: input.payload.role,
        field: input.payload.field,
        value: input.payload.value
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
    ...input.payload.evaluations,
    [currentObject.id]: roleResponse.data!.evaluation
  }

  return buildScoringWorkspaceState({
    createRequest: input.createRequest,
    currentObject,
    evaluations: nextEvaluations,
    selectedObjectId: input.payload.selectedObjectId
  })
}

export function runScoringPersistWorkflow(input: {
  payload: PersistWorkspacePayload
  createRequest: CreateRequest
}) {
  return invokeEvaluationRecordPersist(
    input.createRequest("evaluation_record_manager", input.payload, {
      objectId: input.payload.selectedObjectId
    })
  )
}
