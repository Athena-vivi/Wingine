import { createActivityLogStore, createModuleRegistry, createProtocolDispatcher, type ModuleCallRequest } from "../core/runtime/index.ts"
import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"

export async function runMinimalRuntimeDemo() {
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })

  registry.register({
    module: {
      module_id: "problem_radar.source_input_resolver",
      system: "problem_radar",
      actions: ["resolve"],
      input_contract: "analyze_request",
      output_contract: "normalized_source_input",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/radar/capabilities/sourceInputResolver.resolveSourceInput",
      handler: resolveSourceInput
    }
  })

  const request: ModuleCallRequest = {
    protocol_version: "0.1.0",
    request_id: "runtime-demo-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "minimal-runtime-demo"
    },
    input: {
      redditUrl: "",
      postText: "Seller cannot quickly classify search term waste.",
      comments: "",
      notes: "manual runtime demo"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "runtime-demo-trace"
    }
  }

  const response = await dispatcher.dispatch(request)
  const logs = activityLogStore.list()

  return {
    registry_count: registry.list().length,
    response,
    activity_count: activityLogStore.count(),
    activity_logs: logs
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runMinimalRuntimeDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


