import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { createProblemStoreAdapter } from "./problemStoreAdapter.ts"
import { buildRadarToBuilderRequest } from "../../apps/radar/contracts/radarToBuilder.ts"
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
type ProblemExporterInput = ProblemStructurerInput
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type RadarPhase6Result = {
  standalone: {
    request: ModuleCallRequest<ProblemExporterInput>
    response: DispatchResponse
  }
  manual_sequence: {
    resolver_response: DispatchResponse
    normalizer_response: DispatchResponse
    extractor_response: DispatchResponse
    structurer_response: DispatchResponse
    store_response: DispatchResponse
    exporter_request: ModuleCallRequest<ProblemExporterInput>
    exporter_response: DispatchResponse
  }
  transport_object: Record<string, unknown>
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

export async function runRadarPhase6Demo(): Promise<RadarPhase6Result> {
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

  registry.register({
    module: {
      module_id: "problem_radar.problem_exporter",
      system: "problem_radar",
      actions: ["export"],
      input_contract: "radar_record",
      output_contract: "cross_module_transport_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "apps/radar/contracts/radarToBuilder.buildRadarToBuilderRequest",
      handler: (input) => buildRadarToBuilderRequest(input as ProblemExporterInput)
    }
  })

  const standaloneExporterRequest: ModuleCallRequest<ProblemExporterInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase6-standalone-exporter-request",
    module: "problem_radar.problem_exporter",
    action: "export",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: {
      source_type: "manual",
      source_platform: "manual",
      source_url: "manual://standalone-exporter",
      post_title: "Standalone exporter problem",
      subreddit: "manual",
      raw_problem: "Seller complains about wasted ad spend and unclear term quality.",
      normalized_problem: "Seller struggles with ad waste and unclear term quality.",
      problem_type: "Marketing",
      business_stage: "Discovery",
      emotion_signal: "medium",
      tool_signal: true,
      service_signal: false,
      trend_signal: true,
      record_worthy: true,
      record_reason: "The issue is commercially relevant and repeated.",
      insight: "Ad waste and unclear term quality repeat across seller complaints.",
      product_opportunity: "Create a tool to diagnose wasted search term spend.",
      content_angle: "Use one complaint to explain systematic ad inefficiency."
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-standalone-exporter-trace"
    }
  }

  const standaloneExporterResponse = await dispatcher.dispatch(standaloneExporterRequest)

  const resolverRequest: ModuleCallRequest<RadarCaptureRequest> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase6-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-resolver-trace"
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
    request_id: "radar-phase6-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: {
      sourceMode: resolverResponse.output.sourceMode as "reddit" | "manual",
      normalizedInput: resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-normalizer-trace"
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
    request_id: "radar-phase6-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: {
      source: normalizerResponse.output.source as ProblemExtractorInput["source"],
      notes:
        (resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]).notes ??
        ""
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-extractor-trace"
    }
  }

  const extractorResponse = await dispatcher.dispatch(extractorRequest)

  const radarRecord = buildRadarRecord({
    source: normalizerResponse.output.source as Parameters<typeof buildRadarRecord>[0]["source"],
    analysis: {
      reason: (extractorResponse.output as { analysis: { reason: string } }).analysis.reason,
      recordWorthy: (extractorResponse.output as { analysis: { recordWorthy: boolean } }).analysis.recordWorthy
    },
    businessStage: (
      (extractorResponse.output as { fallback: { businessStage: string } }).fallback
    ).businessStage,
    signals: (
      (extractorResponse.output as {
        fallback: {
          marketSignals: {
            toolSignal: boolean
            serviceSignal: boolean
            trendSignal: boolean
            emotionSignal: string
          }
        }
      }).fallback
    ).marketSignals,
    insightDraft:
      "Sellers are repeatedly surfacing ad-spend waste as a structured problem worth tracking."
  })

  const structurerRequest: ModuleCallRequest<ProblemStructurerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase6-structurer-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-structurer-trace"
    }
  }

  const structurerResponse = await dispatcher.dispatch(structurerRequest)

  const storeRequest: ModuleCallRequest<ProblemStoreInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase6-store-request",
    module: "problem_radar.problem_store_adapter",
    action: "store",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: structurerResponse.output as ProblemStoreInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-store-trace"
    }
  }

  const storeResponse = await dispatcher.dispatch(storeRequest)

  const exporterRequest: ModuleCallRequest<ProblemExporterInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase6-exporter-request",
    module: "problem_radar.problem_exporter",
    action: "export",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase6-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase6-exporter-trace"
    }
  }

  const exporterResponse = await dispatcher.dispatch(exporterRequest)

  return {
    standalone: {
      request: standaloneExporterRequest,
      response: standaloneExporterResponse
    },
    manual_sequence: {
      resolver_response: resolverResponse,
      normalizer_response: normalizerResponse,
      extractor_response: extractorResponse,
      structurer_response: structurerResponse,
      store_response: storeResponse,
      exporter_request: exporterRequest,
      exporter_response: exporterResponse
    },
    transport_object: exporterResponse.output as Record<string, unknown>,
    invocation_ids: [
      getInvocationId(standaloneExporterResponse),
      getInvocationId(resolverResponse),
      getInvocationId(normalizerResponse),
      getInvocationId(extractorResponse),
      getInvocationId(structurerResponse),
      getInvocationId(storeResponse),
      getInvocationId(exporterResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runRadarPhase6Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
