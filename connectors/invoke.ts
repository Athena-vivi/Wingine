import type { FlowContractName } from "../../SharedContracts"

type MainChainPipelinePayload = {
  radar_to_builder?: {
    radarRecord: Record<string, unknown>
  }
  builder_to_scoring?: {
    workflow: Record<string, unknown>
  }
  scoring_to_betting?: {
    evaluation: Record<string, unknown>
  }
}

type InvokeFlowRequest = {
  contract_name: FlowContractName | "mvp_main_chain"
  payload: Record<string, unknown> | MainChainPipelinePayload
}

type ProtocolResult = {
  producer: {
    endpoint: string
    body: unknown
    response: unknown
  }
  consumer: {
    endpoint: string
    body: unknown
    response: unknown
  } | null
}

type PipelineStep = {
  contract_name: FlowContractName
  producer: {
    endpoint: string
    body: unknown
    response: unknown
  }
  consumer: {
    endpoint: string
    body: unknown
    response: unknown
  } | null
}

export type PipelineResult = {
  mode: "single-contract" | "pipeline"
  steps: PipelineStep[]
  halted_at: FlowContractName | null
  message: string
}

function getProtocolBase(system: "radar" | "builder" | "scoring" | "betting") {
  const envMap: Record<typeof system, string | undefined> = {
    radar: process.env.VISUALCLAUSE_RADAR_PROTOCOL_URL,
    builder: process.env.VISUALCLAUSE_BUILDER_PROTOCOL_URL,
    scoring: process.env.VISUALCLAUSE_SCORING_PROTOCOL_URL,
    betting: process.env.VISUALCLAUSE_BETTING_PROTOCOL_URL
  }

  const fallbackMap: Record<typeof system, string> = {
    radar: "http://localhost:3001/api/protocol",
    builder: "http://localhost:3002/api/protocol",
    scoring: "http://localhost:3003/api/protocol",
    betting: "http://localhost:3004/api/protocol"
  }

  return envMap[system] ?? fallbackMap[system]
}

async function postProtocol(endpoint: string, body: unknown) {
  let attempt = 0
  let lastError: unknown = null

  while (attempt <= 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        cache: "no-store"
      })

      return response.json()
    } catch (error) {
      lastError = error
      attempt += 1
    }
  }

  throw lastError instanceof Error ? lastError : new Error("protocol invocation failed")
}

function isSuccessfulResponse(response: unknown) {
  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    (response as { status?: string }).status === "success"
  )
}

function buildConsoleRequest(capability: string, payload: unknown) {
  return {
    request_id: `console-${capability}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    capability,
    caller: { type: "api", id: "visualclause-console" },
    payload,
    context: {}
  }
}

async function invokeSingleFlowContract(request: {
  contract_name: FlowContractName
  payload: Record<string, unknown>
}): Promise<ProtocolResult> {
  switch (request.contract_name) {
    case "radar_to_builder": {
      const radarEndpoint = `${getProtocolBase("radar")}/problem_export`
      const radarBody = buildConsoleRequest("problem_export", request.payload)
      const radarResponse = await postProtocol(radarEndpoint, radarBody)
      const exportedProblem =
        (radarResponse as { data?: { contract_request?: { object?: unknown } } }).data?.contract_request?.object ?? null

      let builderStep: ProtocolResult["consumer"] = null

      if (exportedProblem && isSuccessfulResponse(radarResponse)) {
        const builderEndpoint = `${getProtocolBase("builder")}/problem_import`
        const builderBody = buildConsoleRequest("problem_import", {
          problem: exportedProblem
        })
        const builderResponse = await postProtocol(builderEndpoint, builderBody)
        builderStep = {
          endpoint: builderEndpoint,
          body: builderBody,
          response: builderResponse
        }
      }

      return {
        producer: {
          endpoint: radarEndpoint,
          body: radarBody,
          response: radarResponse
        },
        consumer: builderStep
      }
    }
    case "builder_to_scoring": {
      const builderEndpoint = `${getProtocolBase("builder")}/workflow_export`
      const builderBody = buildConsoleRequest("workflow_export", request.payload)
      const builderResponse = await postProtocol(builderEndpoint, builderBody)
      const exportedWorkflow =
        (builderResponse as { data?: { workflow?: unknown } }).data?.workflow ?? null

      let scoringStep: ProtocolResult["consumer"] = null

      if (exportedWorkflow && isSuccessfulResponse(builderResponse)) {
        const scoringEndpoint = `${getProtocolBase("scoring")}/workflow_import`
        const scoringBody = {
          request_id: `console-workflow-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          workflow: exportedWorkflow
        }
        const scoringResponse = await postProtocol(scoringEndpoint, scoringBody)
        scoringStep = {
          endpoint: scoringEndpoint,
          body: scoringBody,
          response: scoringResponse
        }
      }

      return {
        producer: {
          endpoint: builderEndpoint,
          body: builderBody,
          response: builderResponse
        },
        consumer: scoringStep
      }
    }
    case "scoring_to_betting": {
      const scoringEndpoint = `${getProtocolBase("scoring")}/score_export`
      const scoringBody = {
        request_id: `console-score-export-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        object: request.payload.object,
        evaluation: request.payload.evaluation
      }
      const scoringResponse = await postProtocol(scoringEndpoint, scoringBody)
      const exportedScore =
        (scoringResponse as { data?: { score?: unknown } }).data?.score ?? null

      let bettingStep: ProtocolResult["consumer"] = null

      if (exportedScore && isSuccessfulResponse(scoringResponse)) {
        const bettingEndpoint = `${getProtocolBase("betting")}/score_import`
        const bettingBody = {
          request_id: `console-score-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          score: exportedScore
        }
        const bettingResponse = await postProtocol(bettingEndpoint, bettingBody)
        bettingStep = {
          endpoint: bettingEndpoint,
          body: bettingBody,
          response: bettingResponse
        }
      }

      return {
        producer: {
          endpoint: scoringEndpoint,
          body: scoringBody,
          response: scoringResponse
        },
        consumer: bettingStep
      }
    }
    default:
      throw new Error(`Unsupported flow contract invocation: ${request.contract_name}`)
  }
}

function createPipelineResult(
  steps: PipelineStep[],
  halted_at: FlowContractName | null,
  message: string
): PipelineResult {
  return {
    mode: "pipeline",
    steps,
    halted_at,
    message
  }
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export async function invokeFlowContract(request: InvokeFlowRequest): Promise<ProtocolResult | PipelineResult> {
  if (request.contract_name !== "mvp_main_chain") {
    return invokeSingleFlowContract({
      contract_name: request.contract_name,
      payload: request.payload as Record<string, unknown>
    })
  }

  const payload = request.payload as MainChainPipelinePayload
  const steps: PipelineStep[] = []

  if (!isObjectRecord(payload.radar_to_builder)) {
    return createPipelineResult(steps, "radar_to_builder", "Missing radar_to_builder payload.")
  }

  const radarToBuilder = await invokeSingleFlowContract({
    contract_name: "radar_to_builder",
    payload: payload.radar_to_builder
  })
  steps.push(toPipelineStep("radar_to_builder", radarToBuilder))

  if (!isSuccessfulResponse(radarToBuilder.producer.response) || !radarToBuilder.consumer || !isSuccessfulResponse(radarToBuilder.consumer.response)) {
    return createPipelineResult(steps, "radar_to_builder", "Pipeline stopped at radar_to_builder.")
  }

  const importedProblem =
    (radarToBuilder.consumer.response as { data?: { problem?: Record<string, unknown> } }).data?.problem ?? null

  if (!importedProblem || !isObjectRecord(payload.builder_to_scoring) || !isObjectRecord(payload.builder_to_scoring.workflow)) {
    return createPipelineResult(steps, "builder_to_scoring", "Missing builder_to_scoring workflow payload.")
  }

  const builderToScoring = await invokeSingleFlowContract({
    contract_name: "builder_to_scoring",
    payload: {
      workflow: payload.builder_to_scoring.workflow,
      problem: importedProblem
    }
  })
  steps.push(toPipelineStep("builder_to_scoring", builderToScoring))

  if (!isSuccessfulResponse(builderToScoring.producer.response) || !builderToScoring.consumer || !isSuccessfulResponse(builderToScoring.consumer.response)) {
    return createPipelineResult(steps, "builder_to_scoring", "Pipeline stopped at builder_to_scoring.")
  }

  const scoringObject =
    (builderToScoring.consumer.response as { data?: { object?: Record<string, unknown> } }).data?.object ?? null

  if (!scoringObject || !isObjectRecord(payload.scoring_to_betting) || !isObjectRecord(payload.scoring_to_betting.evaluation)) {
    return createPipelineResult(steps, "scoring_to_betting", "Missing scoring_to_betting evaluation payload.")
  }

  const scoringToBetting = await invokeSingleFlowContract({
    contract_name: "scoring_to_betting",
    payload: {
      object: scoringObject,
      evaluation: payload.scoring_to_betting.evaluation
    }
  })
  steps.push(toPipelineStep("scoring_to_betting", scoringToBetting))

  if (!isSuccessfulResponse(scoringToBetting.producer.response) || !scoringToBetting.consumer || !isSuccessfulResponse(scoringToBetting.consumer.response)) {
    return createPipelineResult(steps, "scoring_to_betting", "Pipeline stopped at scoring_to_betting.")
  }

  return createPipelineResult(steps, null, "Main chain pipeline completed.")
}

function toPipelineStep(
  contract_name: FlowContractName,
  result: ProtocolResult
): PipelineStep {
  return {
    contract_name,
    producer: result.producer,
    consumer: result.consumer
  }
}
