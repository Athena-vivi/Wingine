import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { buildManualSource } from "../../apps/radar/capabilities/manualSourceBuilder.ts"
import { buildRadarRecord } from "../../apps/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../../apps/radar/capabilities/sourceInputResolver.ts"
import { invokeConfidenceResolver } from "../../apps/scoring/capabilities/confidenceResolver.ts"

type MultiModuleResult = {
  registry_count: number
  invocation_count: number
  activity_count: number
  module_get_results: Record<string, boolean>
  response_statuses: Record<string, string>
  invocation_ids: string[]
  activity_logs: Array<{
    module_id: string
    action: string
    status: "success" | "error"
    timestamp: string
  }>
}

function getInvocationId(response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>) {
  const custom = response.meta.custom

  if (!custom || typeof custom.invocation_id !== "string") {
    throw new Error("invocation_id missing from response meta")
  }

  return custom.invocation_id
}

export async function runMultiModuleStabilityTest(): Promise<MultiModuleResult> {
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
      target: "apps/radar/capabilities/sourceInputResolver.resolveSourceInput",
      handler: resolveSourceInput
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.manual_source_builder",
      system: "problem_radar",
      actions: ["build"],
      input_contract: "analyze_request",
      output_contract: "reddit_post_data",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/manualSourceBuilder.buildManualSource",
      handler: buildManualSource
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.radar_record_builder",
      system: "problem_radar",
      actions: ["build"],
      input_contract: "radar_record_input",
      output_contract: "radar_record",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/radarRecordBuilder.buildRadarRecord",
      handler: buildRadarRecord
    }
  })

  registry.register({
    module: {
      module_id: "scoring.confidence_resolver",
      system: "scoring",
      actions: ["resolve"],
      input_contract: "scoring_protocol_request",
      output_contract: "scoring_protocol_response",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/scoring/capabilities/confidenceResolver.invokeConfidenceResolver",
      handler: invokeConfidenceResolver
    }
  })

  const requests: ModuleCallRequest[] = [
    {
      protocol_version: "0.1.0",
      request_id: "runtime-stability-request-a",
      module: "problem_radar.source_input_resolver",
      action: "resolve",
      caller: {
        system: "runtime_test",
        role: "runtime",
        id: "stability-test"
      },
      input: {
        redditUrl: "",
        postText: "Sellers keep wasting spend on search term targeting.",
        comments: "",
        notes: "request A"
      },
      meta: {
        timestamp: new Date().toISOString(),
        trace_id: "runtime-stability-a"
      }
    },
    {
      protocol_version: "0.1.0",
      request_id: "runtime-stability-request-b",
      module: "problem_radar.manual_source_builder",
      action: "build",
      caller: {
        system: "runtime_test",
        role: "runtime",
        id: "stability-test"
      },
      input: {
        redditUrl: "",
        postText: "Manual source for runtime stability test.",
        comments: "first comment\nsecond comment",
        notes: "request B"
      },
      meta: {
        timestamp: new Date().toISOString(),
        trace_id: "runtime-stability-b"
      }
    },
    {
      protocol_version: "0.1.0",
      request_id: "runtime-stability-request-c",
      module: "problem_radar.radar_record_builder",
      action: "build",
      caller: {
        system: "runtime_test",
        role: "runtime",
        id: "stability-test"
      },
      input: {
        source: {
          url: "manual://runtime-stability",
          title: "Runtime stability seller issue",
          selftext: "The seller cannot decide which keywords deserve budget.",
          subreddit: "manual",
          score: 0,
          comments: [
            {
              author: "manual_user_1",
              score: 0,
              body: "We keep wasting ad spend on bad search terms."
            }
          ]
        },
        analysis: {
          reason: "The issue is repeated and commercially relevant.",
          recordWorthy: true
        },
        businessStage: "Discovery",
        signals: {
          toolSignal: true,
          serviceSignal: false,
          trendSignal: true,
          emotionSignal: "medium"
        },
        insightDraft: "Search term waste is a recurring seller pain point."
      },
      meta: {
        timestamp: new Date().toISOString(),
        trace_id: "runtime-stability-c"
      }
    },
    {
      protocol_version: "0.1.0",
      request_id: "runtime-stability-request-d",
      module: "scoring.confidence_resolver",
      action: "resolve",
      caller: {
        system: "runtime_test",
        role: "runtime",
        id: "stability-test"
      },
      input: {
        request_id: "scoring-confidence-request",
        payload: {
          dimensions: {
            value: { score: 4.2, confidence: 0.8 },
            quality: { score: 3.9, confidence: 0.75 },
            leverage: { score: 4.1, confidence: 0.7 },
            reliability: { score: 3.7, confidence: 0.85 }
          }
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        trace_id: "runtime-stability-d"
      }
    }
  ]

  const responses = []

  for (const request of requests) {
    responses.push(await dispatcher.dispatch(request))
  }

  const invocationIds = responses.map(getInvocationId)
  const responseStatuses = Object.fromEntries(
    responses.map((response) => [response.module, response.status])
  )
  const moduleGetResults = Object.fromEntries(
    registry.list().map((record) => [record.module.module_id, registry.get(record.module.module_id) !== null])
  )

  return {
    registry_count: registry.list().length,
    invocation_count: invocationIds.length,
    activity_count: activityLogStore.count(),
    module_get_results: moduleGetResults,
    response_statuses: responseStatuses,
    invocation_ids: invocationIds,
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runMultiModuleStabilityTest()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
