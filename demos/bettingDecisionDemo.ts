import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "../core/runtime/index.ts"
import { resolveBetDecision, type DecisionInput } from "../core/betting/bettingDecisionResolver.ts"
import { runScoringSystemEvaluatorDemo } from "./scoringSystemEvaluatorDemo.ts"
import type { BetObject, ScoreObject } from "../core/modules/shared/index.ts"

type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type BettingDecisionDemoResult = {
  input_score: ScoreObject
  standalone_response: DispatchResponse
  manual_response: DispatchResponse
  invocation_ids: string[]
  activity_count: number
  activity_logs: Array<{
    module_id: string
    action: string
    status: "success" | "error"
    timestamp: string
  }>
}

function getInvocationId(response: DispatchResponse) {
  const custom = response.meta.custom

  if (!custom || typeof custom.invocation_id !== "string") {
    throw new Error("invocation_id missing from response meta")
  }

  return custom.invocation_id
}

export async function runBettingDecisionDemo(): Promise<BettingDecisionDemoResult> {
  const scoringResult = await runScoringSystemEvaluatorDemo()
  const manualScore = scoringResult.manual_response.output as ScoreObject
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })

  registry.register({
    module: {
      module_id: "betting.decision_resolver",
      system: "betting",
      actions: ["resolve"],
      input_contract: "score_object",
      output_contract: "bet_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/betting/bettingDecisionResolver.ts.resolveBetDecision",
      handler: (input) => resolveBetDecision(input as DecisionInput)
    }
  })

  const standaloneRequest: ModuleCallRequest<DecisionInput> = {
    protocol_version: "0.1.0",
    request_id: "betting-decision-standalone-request",
    module: "betting.decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "betting-decision-demo"
    },
    input: {
      score: manualScore
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "betting-decision-standalone-trace"
    }
  }

  const standaloneResponse = await dispatcher.dispatch(standaloneRequest)

  const manualRequest: ModuleCallRequest<DecisionInput> = {
    protocol_version: "0.1.0",
    request_id: "betting-decision-manual-request",
    module: "betting.decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "betting-decision-demo"
    },
    input: {
      score: manualScore
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "betting-decision-manual-trace"
    }
  }

  const manualResponse = await dispatcher.dispatch(manualRequest)
  const standaloneBet = standaloneResponse.output as BetObject
  const manualBet = manualResponse.output as BetObject

  if (!standaloneBet?.id || !manualBet?.id) {
    throw new Error("bet object was not produced")
  }

  return {
    input_score: manualScore,
    standalone_response: standaloneResponse,
    manual_response: manualResponse,
    invocation_ids: [getInvocationId(standaloneResponse), getInvocationId(manualResponse)],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runBettingDecisionDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


