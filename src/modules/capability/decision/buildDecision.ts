import { exportScoreObjectFromEvaluation } from "./scoring_module/adapters/scoreExportAdapter.ts"
import { invokeConfidenceResolver } from "./scoring_module/capabilities/confidenceResolver.ts"
import { invokeGateResolver } from "./scoring_module/capabilities/gateResolver.ts"
import { invokeScoreAggregator } from "./scoring_module/capabilities/scoreAggregator.ts"
import { invokeAllocationResolver } from "./betting_module/capabilities/allocationResolver.ts"
import { invokeBettingInputResolver } from "./betting_module/capabilities/bettingInputResolver.ts"
import { invokeDecisionResolver } from "./betting_module/capabilities/decisionResolver.ts"
import { invokeFactorNormalizer } from "./betting_module/capabilities/factorNormalizer.ts"
import { importScoreObjectToBettingSignal } from "./betting_module/adapters/scoreImportAdapter.ts"
import type { ScoreObject } from "../shared/index.ts"
import type {
  ProtocolContext as BettingProtocolContext,
  ProtocolRequest as BettingProtocolRequest
} from "./betting_module/types/protocol.ts"
import type { BettingInput, BettingCandidate } from "./betting_module/types/betting.ts"
import type {
  ProtocolContext as ScoringProtocolContext,
  ProtocolRequest as ScoringProtocolRequest
} from "./scoring_module/types/protocol.ts"
import type {
  EvaluationRecord,
  GateResult,
  ScoringDimension,
  ScoringObject,
  ScoringObjectType,
  EvaluatorRole
} from "./scoring_module/types/scoring.ts"
import type { BuildDecisionTarget, DecisionResult } from "../../../contracts/decision.ts"

type ErrorBlock = {
  code: string
  message: string
}

type DecisionFailure = {
  status: "error"
  request_id: string
  error: ErrorBlock
}

type DecisionSuccess<TData> = {
  status: "success"
  data: TData
}

type ScoringRequestFactory = <TPayload>(
  capability: string,
  payload: TPayload,
  context: ScoringProtocolContext
) => ScoringProtocolRequest<TPayload>

type BettingRequestFactory = <TPayload>(
  capability: string,
  payload: TPayload,
  context: BettingProtocolContext
) => BettingProtocolRequest<TPayload>

export type BuildScoreDecision = {
  weighted_score: number
  dimension_average: number
  confidence: number
  gate_result: GateResult
}

export function evaluateBuildScore(input: {
  createRequest: ScoringRequestFactory
  requestContext: ScoringProtocolContext
  objectType: ScoringObjectType
  dimensions: Record<ScoringDimension, EvaluationRecord["dimensions"][ScoringDimension]>
}): DecisionSuccess<BuildScoreDecision> | DecisionFailure {
  const aggregateResponse = invokeScoreAggregator(
    input.createRequest(
      "score_aggregator",
      {
        object_type: input.objectType,
        dimensions: input.dimensions
      },
      input.requestContext
    )
  )

  const confidenceResponse = invokeConfidenceResolver(
    input.createRequest(
      "confidence_resolver",
      {
        dimensions: input.dimensions
      },
      input.requestContext
    )
  )

  if (aggregateResponse.status === "error" || confidenceResponse.status === "error") {
    const error = aggregateResponse.error ?? confidenceResponse.error

    return {
      status: "error",
      request_id: aggregateResponse.status === "error" ? aggregateResponse.request_id : confidenceResponse.request_id,
      error: {
        code: error?.code ?? "build_score_failed",
        message: error?.message ?? "build score evaluation failed"
      }
    }
  }

  const gateResponse = invokeGateResolver(
    input.createRequest(
      "gate_resolver",
      {
        weighted_score: aggregateResponse.data!.weighted_score,
        confidence: confidenceResponse.data!.confidence,
        dimensions: input.dimensions
      },
      input.requestContext
    )
  )

  if (gateResponse.status === "error") {
    return {
      status: "error",
      request_id: gateResponse.request_id,
      error: {
        code: gateResponse.error?.code ?? "build_gate_failed",
        message: gateResponse.error?.message ?? "build gate evaluation failed"
      }
    }
  }

  return {
    status: "success",
    data: {
      weighted_score: aggregateResponse.data!.weighted_score,
      dimension_average: aggregateResponse.data!.dimension_average,
      confidence: confidenceResponse.data!.confidence,
      gate_result: gateResponse.data!.result
    }
  }
}

export function scoreBuildResult(input: {
  evaluation: EvaluationRecord
  object: ScoringObject
}): DecisionSuccess<{ score: ScoreObject; role: EvaluatorRole | null }> {
  const roleEntries = Object.values(input.evaluation.execution.roleInputs)
  const activeRole = roleEntries.find((entry) => entry.status === "active")?.role ?? null

  return {
    status: "success",
    data: {
      score: exportScoreObjectFromEvaluation({
        evaluation: input.evaluation,
        object: input.object
      }),
      role: activeRole
    }
  }
}

export function decideBuild(input: {
  createRequest: BettingRequestFactory
  requestContext: BettingProtocolContext
  buildResult: BuildDecisionTarget
}): DecisionSuccess<DecisionResult> | DecisionFailure {
  const importedSignal = input.buildResult.score ? importScoreObjectToBettingSignal(input.buildResult.score) : null
  const resolvedInput = input.buildResult.input ?? importedSignal?.input

  if (!resolvedInput) {
    return {
      status: "error",
      request_id: "betting_input_resolver-missing-build-input",
      error: {
        code: "missing_input",
        message: "build decision requires score or betting input"
      }
    }
  }

  const inputResponse = invokeBettingInputResolver(
    input.createRequest("betting_input_resolver", resolvedInput, input.requestContext)
  )

  if (inputResponse.status === "error") {
    return {
      status: "error",
      request_id: inputResponse.request_id,
      error: {
        code: inputResponse.error?.code ?? "missing_input",
        message: inputResponse.error?.message ?? "betting input resolution failed"
      }
    }
  }

  const normalizedResponse = invokeFactorNormalizer(
    input.createRequest("factor_normalizer", inputResponse.data!.betting_input, input.requestContext)
  )

  const decisionResponse = invokeDecisionResolver(
    input.createRequest("decision_resolver", inputResponse.data!.betting_input, input.requestContext)
  )

  if (normalizedResponse.status === "error" || decisionResponse.status === "error") {
    const error = normalizedResponse.error ?? decisionResponse.error

    return {
      status: "error",
      request_id: normalizedResponse.status === "error" ? normalizedResponse.request_id : decisionResponse.request_id,
      error: {
        code: error?.code ?? "build_decision_failed",
        message: error?.message ?? "build decision resolution failed"
      }
    }
  }

  const allocationResponse = invokeAllocationResolver(
    input.createRequest(
      "allocation_resolver",
      {
        decision: decisionResponse.data!.decision
      },
      input.requestContext
    )
  )

  if (allocationResponse.status === "error") {
    return {
      status: "error",
      request_id: allocationResponse.request_id,
      error: {
        code: allocationResponse.error?.code ?? "allocation_failed",
        message: allocationResponse.error?.message ?? "build allocation resolution failed"
      }
    }
  }

  return {
    status: "success",
    data: {
      score: inputResponse.data!.betting_input.score,
      strategy: decisionResponse.data!.reason,
      role: input.buildResult.role ?? undefined,
      confidence: inputResponse.data!.betting_input.confidence,
      metadata: {
        score_object: input.buildResult.score ?? null,
        bet_decision: decisionResponse.data!.decision,
        allocation: allocationResponse.data!.resource_allocation,
        input: inputResponse.data!.betting_input,
        normalized_factors: normalizedResponse.data!.normalized_factors,
        candidate: importedSignal?.candidate ?? null
      }
    }
  }
}

