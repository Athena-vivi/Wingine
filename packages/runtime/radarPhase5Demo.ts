import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { createProblemStoreAdapter } from "./problemStoreAdapter.ts"
import { exportProblemObjectFromRadarRecord } from "../../apps/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../../apps/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../../apps/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../../apps/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../../apps/radar/capabilities/sourceMaterialNormalizer.ts"
import type { ProblemObject } from "../shared/index.ts"

type RadarCaptureRequest = {
  source: {
    provider: string
    url?: string
  }
  raw_text?: string
}

type SourceNormalizerInput = {
  sourceMode: "reddit" | "manual"
  normalizedInput: {
    redditUrl?: string
    postText?: string
    comments?: string
    notes?: string
  }
}

type ProblemExtractorInput = {
  source: {
    url: string
    title: string
    selftext: string
    subreddit: string
    score: number
    comments: Array<{
      author: string
      score: number
      body: string
    }>
  }
  notes: string
}

type ProblemStructurerInput = Parameters<typeof exportProblemObjectFromRadarRecord>[0]
type ProblemStoreInput = ProblemObject
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type RadarPhase5Result = {
  standalone: {
    request: ModuleCallRequest<ProblemStoreInput>
    response: DispatchResponse
  }
  manual_sequence: {
    resolver_response: DispatchResponse
    normalizer_response: DispatchResponse
    extractor_response: DispatchResponse
    structurer_response: DispatchResponse
    store_request: ModuleCallRequest<ProblemStoreInput>
    store_response: DispatchResponse
  }
  storage_ref: string
  stored_record_count: number
  invocation_ids: string[]
  activity_count: number
  activity_logs: Array<{
    module_id: string
    action: string
    status: "success" | "error"
    timestamp: string
  }>
}

function adaptCaptureRequest(input: RadarCaptureRequest) {
  return {
    redditUrl: input.source.url ?? "",
    postText: input.raw_text ?? "",
    comments: "",
    notes: `source_provider:${input.source.provider}`
  }
}

function getInvocationId(response: DispatchResponse) {
  const custom = response.meta.custom

  if (!custom || typeof custom.invocation_id !== "string") {
    throw new Error("invocation_id missing from response meta")
  }

  return custom.invocation_id
}

export async function runRadarPhase5Demo(): Promise<RadarPhase5Result> {
  const registry = createModuleRegistry()
  const activityLogStore = createActivityLogStore()
  const dispatcher = createProtocolDispatcher({
    registry,
    activityLogStore
  })
  const problemStoreAdapter = createProblemStoreAdapter()

  registry.register({
    module: {
      module_id: "problem_radar.source_input_resolver",
      system: "problem_radar",
      actions: ["resolve"],
      input_contract: "radar_capture_request",
      output_contract: "normalized_source_input",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/sourceInputResolver.resolveSourceInput",
      handler: (input) => resolveSourceInput(adaptCaptureRequest(input as RadarCaptureRequest))
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.source_normalizer",
      system: "problem_radar",
      actions: ["normalize"],
      input_contract: "normalized_source_input",
      output_contract: "normalized_source_material",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/sourceMaterialNormalizer.resolveSourceMaterial",
      handler: (input) => resolveSourceMaterial(input as SourceNormalizerInput)
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.problem_extractor",
      system: "problem_radar",
      actions: ["extract"],
      input_contract: "source_analysis_input",
      output_contract: "problem_analysis_result",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/capabilities/problemAnalysisEngine.runProblemAnalysis",
      handler: runProblemAnalysis
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.problem_structurer",
      system: "problem_radar",
      actions: ["structure"],
      input_contract: "radar_record",
      output_contract: "problem_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/adapters/problemExportAdapter.exportProblemObjectFromRadarRecord",
      handler: (input) => exportProblemObjectFromRadarRecord(input as ProblemStructurerInput)
    }
  })

  registry.register({
    module: {
      module_id: "problem_radar.problem_store_adapter",
      system: "problem_radar",
      actions: ["store"],
      input_contract: "problem_object",
      output_contract: "storage_ref",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/problemStoreAdapter.store",
      handler: (input) => problemStoreAdapter.store(input as ProblemStoreInput)
    }
  })

  const standaloneStoreRequest: ModuleCallRequest<ProblemStoreInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-standalone-store-request",
    module: "problem_radar.problem_store_adapter",
    action: "store",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: {
      id: "problem_manual://standalone-store",
      type: "problem",
      source: {
        system: "radar",
        origin_id: "manual://standalone-store",
        origin_ref: "manual://standalone-store"
      },
      status: "structured",
      metadata: {
        tags: ["marketing", "manual"],
        labels: ["medium"],
        custom: {
          source_platform: "manual"
        }
      },
      timestamps: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        observed_at: new Date().toISOString()
      },
      title: "Standalone stored problem",
      summary: "Standalone problem storage validation.",
      description: "A standalone problem object for storage validation.",
      normalized_problem: "Standalone problem storage validation",
      record_worthy: true
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-standalone-store-trace"
    }
  }

  const standaloneStoreResponse = await dispatcher.dispatch(standaloneStoreRequest)

  const resolverRequest: ModuleCallRequest<RadarCaptureRequest> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-resolver-trace"
    }
  }

  const resolverResponse = await dispatcher.dispatch(resolverRequest)

  if (
    !resolverResponse.output ||
    typeof resolverResponse.output !== "object" ||
    !("sourceMode" in resolverResponse.output) ||
    !("normalizedInput" in resolverResponse.output)
  ) {
    throw new Error("resolver output is not compatible with source_normalizer input")
  }

  const normalizerRequest: ModuleCallRequest<SourceNormalizerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: {
      sourceMode: resolverResponse.output.sourceMode as "reddit" | "manual",
      normalizedInput: resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-normalizer-trace"
    }
  }

  const normalizerResponse = await dispatcher.dispatch(normalizerRequest)

  if (
    !normalizerResponse.output ||
    typeof normalizerResponse.output !== "object" ||
    !("source" in normalizerResponse.output)
  ) {
    throw new Error("normalizer output is not compatible with problem_extractor input")
  }

  const extractorRequest: ModuleCallRequest<ProblemExtractorInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: {
      source: normalizerResponse.output.source as ProblemExtractorInput["source"],
      notes:
        (resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]).notes ??
        ""
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-extractor-trace"
    }
  }

  const extractorResponse = await dispatcher.dispatch(extractorRequest)

  if (
    !extractorResponse.output ||
    typeof extractorResponse.output !== "object" ||
    !("analysis" in extractorResponse.output) ||
    !("fallback" in extractorResponse.output)
  ) {
    throw new Error("extractor output is not compatible with manual problem structuring")
  }

  const radarRecord = buildRadarRecord({
    source: normalizerResponse.output.source as Parameters<typeof buildRadarRecord>[0]["source"],
    analysis: {
      reason: (extractorResponse.output.analysis as { reason: string }).reason,
      recordWorthy: (extractorResponse.output.analysis as { recordWorthy: boolean }).recordWorthy
    },
    businessStage: (
      extractorResponse.output.fallback as { businessStage: string }
    ).businessStage,
    signals: (
      extractorResponse.output.fallback as {
        marketSignals: {
          toolSignal: boolean
          serviceSignal: boolean
          trendSignal: boolean
          emotionSignal: string
        }
      }
    ).marketSignals,
    insightDraft:
      "Sellers are repeatedly surfacing ad-spend waste as a structured problem worth tracking."
  })

  const structurerRequest: ModuleCallRequest<ProblemStructurerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-structurer-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-structurer-trace"
    }
  }

  const structurerResponse = await dispatcher.dispatch(structurerRequest)

  if (!structurerResponse.output || typeof structurerResponse.output !== "object") {
    throw new Error("structurer output is not compatible with problem_store_adapter input")
  }

  const storeRequest: ModuleCallRequest<ProblemStoreInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase5-store-request",
    module: "problem_radar.problem_store_adapter",
    action: "store",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase5-demo"
    },
    input: structurerResponse.output as ProblemStoreInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase5-store-trace"
    }
  }

  const storeResponse = await dispatcher.dispatch(storeRequest)

  if (
    !storeResponse.output ||
    typeof storeResponse.output !== "object" ||
    typeof (storeResponse.output as Record<string, unknown>).storage_ref !== "string"
  ) {
    throw new Error("store response is missing storage_ref")
  }

  return {
    standalone: {
      request: standaloneStoreRequest,
      response: standaloneStoreResponse
    },
    manual_sequence: {
      resolver_response: resolverResponse,
      normalizer_response: normalizerResponse,
      extractor_response: extractorResponse,
      structurer_response: structurerResponse,
      store_request: storeRequest,
      store_response: storeResponse
    },
    storage_ref: (storeResponse.output as { storage_ref: string }).storage_ref,
    stored_record_count: problemStoreAdapter.count(),
    invocation_ids: [
      getInvocationId(standaloneStoreResponse),
      getInvocationId(resolverResponse),
      getInvocationId(normalizerResponse),
      getInvocationId(extractorResponse),
      getInvocationId(structurerResponse),
      getInvocationId(storeResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runRadarPhase5Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
