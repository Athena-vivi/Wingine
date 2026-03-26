import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { exportProblemObjectFromRadarRecord } from "../../apps/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../../apps/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../../apps/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../../apps/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../../apps/radar/capabilities/sourceMaterialNormalizer.ts"

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

type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type RadarPhase4Result = {
  standalone: {
    request: ModuleCallRequest<ProblemStructurerInput>
    response: DispatchResponse
    output_shape: string[]
    required_field_check: {
      id: boolean
      type: boolean
      summary: boolean
      normalized_problem: boolean
    }
  }
  manual_sequence: {
    resolver_response: DispatchResponse
    normalizer_response: DispatchResponse
    extractor_response: DispatchResponse
    structurer_request: ModuleCallRequest<ProblemStructurerInput>
    structurer_response: DispatchResponse
  }
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

function buildStructurerCheck(output: unknown) {
  const record = (output ?? {}) as Record<string, unknown>

  return {
    id: typeof record.id === "string" && record.id.length > 0,
    type: record.type === "problem",
    summary: typeof record.summary === "string" && record.summary.length > 0,
    normalized_problem:
      typeof record.normalized_problem === "string" && record.normalized_problem.length > 0
  }
}

export async function runRadarPhase4Demo(): Promise<RadarPhase4Result> {
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

  const standaloneStructurerRequest: ModuleCallRequest<ProblemStructurerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase4-standalone-structurer-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase4-demo"
    },
    input: {
      source_type: "manual",
      source_platform: "manual",
      source_url: "manual://standalone-problem-structurer",
      post_title: "Seller ad spend problem",
      subreddit: "manual",
      raw_problem: "Seller complains about wasted ad spend and poor ACoS performance.",
      normalized_problem: "Seller struggles with wasted ad spend and high ACoS.",
      problem_type: "Marketing",
      business_stage: "Discovery",
      emotion_signal: "medium",
      tool_signal: true,
      service_signal: false,
      trend_signal: true,
      record_worthy: true,
      record_reason: "The issue is commercially relevant and repeated.",
      insight: "Repeated ad efficiency complaints point to a reusable problem profile.",
      product_opportunity: "Create a tool to surface waste drivers and remediation actions.",
      content_angle: "Use one seller complaint to explain budget waste patterns."
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase4-standalone-structurer-trace"
    }
  }

  const standaloneStructurerResponse = await dispatcher.dispatch(standaloneStructurerRequest)

  const resolverRequest: ModuleCallRequest<RadarCaptureRequest> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase4-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase4-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase4-resolver-trace"
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
    request_id: "radar-phase4-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase4-demo"
    },
    input: {
      sourceMode: resolverResponse.output.sourceMode as "reddit" | "manual",
      normalizedInput: resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase4-normalizer-trace"
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
    request_id: "radar-phase4-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase4-demo"
    },
    input: {
      source: normalizerResponse.output.source as ProblemExtractorInput["source"],
      notes:
        (resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]).notes ??
        ""
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase4-extractor-trace"
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
    request_id: "radar-phase4-structurer-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase4-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase4-structurer-trace"
    }
  }

  const structurerResponse = await dispatcher.dispatch(structurerRequest)
  const outputShape =
    structurerResponse.output && typeof structurerResponse.output === "object"
      ? Object.keys(structurerResponse.output as Record<string, unknown>)
      : []

  return {
    standalone: {
      request: standaloneStructurerRequest,
      response: standaloneStructurerResponse,
      output_shape: outputShape,
      required_field_check: buildStructurerCheck(structurerResponse.output)
    },
    manual_sequence: {
      resolver_response: resolverResponse,
      normalizer_response: normalizerResponse,
      extractor_response: extractorResponse,
      structurer_request: structurerRequest,
      structurer_response: structurerResponse
    },
    invocation_ids: [
      getInvocationId(standaloneStructurerResponse),
      getInvocationId(resolverResponse),
      getInvocationId(normalizerResponse),
      getInvocationId(extractorResponse),
      getInvocationId(structurerResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runRadarPhase4Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
