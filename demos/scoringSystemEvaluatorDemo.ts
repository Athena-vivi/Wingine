import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "../core/runtime/index.ts"
import { evaluateSystemSpec, type SystemEvaluatorInput } from "../core/scoring/systemEvaluator.ts"
import { runBuilderSystemSpecDemo } from "./builderSystemSpecDemo.ts"
import type { ScoreObject } from "../core/modules/shared/index.ts"

type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: Array<{
    from: string
    to: string
  }>
}

type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type ScoringSystemEvaluatorResult = {
  input_spec: SystemSpec
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

export async function runScoringSystemEvaluatorDemo(): Promise<ScoringSystemEvaluatorResult> {
  const builderResult = await runBuilderSystemSpecDemo()
  const manualSpec = builderResult.manual_sequence.spec_response.output as SystemSpec
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })

  registry.register({
    module: {
      module_id: "scoring.system_evaluator",
      system: "scoring",
      actions: ["evaluate"],
      input_contract: "system_spec",
      output_contract: "score_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/scoring/systemEvaluator.ts.evaluateSystemSpec",
      handler: (input) => evaluateSystemSpec(input as SystemEvaluatorInput)
    }
  })

  const standaloneSpec: SystemSpec = {
    type: "system_spec",
    modules: [
      "builder.problem_spec_loader",
      "builder.system_goal_resolver",
      "builder.module_planner",
      "builder.workflow_planner"
    ],
    flows: [
      { from: "builder.problem_spec_loader", to: "builder.system_goal_resolver" },
      { from: "builder.system_goal_resolver", to: "builder.module_planner" },
      { from: "builder.module_planner", to: "builder.workflow_planner" }
    ]
  }

  const standaloneRequest: ModuleCallRequest<SystemEvaluatorInput> = {
    protocol_version: "0.1.0",
    request_id: "scoring-system-evaluator-standalone-request",
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "scoring-system-evaluator-demo"
    },
    input: {
      spec: standaloneSpec
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "scoring-system-evaluator-standalone-trace"
    }
  }

  const standaloneResponse = await dispatcher.dispatch(standaloneRequest)

  const manualRequest: ModuleCallRequest<SystemEvaluatorInput> = {
    protocol_version: "0.1.0",
    request_id: "scoring-system-evaluator-manual-request",
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "scoring-system-evaluator-demo"
    },
    input: {
      spec: manualSpec
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "scoring-system-evaluator-manual-trace"
    }
  }

  const manualResponse = await dispatcher.dispatch(manualRequest)
  const standaloneScore = standaloneResponse.output as ScoreObject
  const manualScore = manualResponse.output as ScoreObject

  if (!standaloneScore?.object_id || !manualScore?.object_id) {
    throw new Error("score object was not produced")
  }

  return {
    input_spec: manualSpec,
    standalone_response: standaloneResponse,
    manual_response: manualResponse,
    invocation_ids: [getInvocationId(standaloneResponse), getInvocationId(manualResponse)],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runScoringSystemEvaluatorDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


