import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "../core/runtime/index.ts"
import { runProblemAnalysis } from "../core/modules/radar/capabilities/problemAnalysisEngine.ts"
import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../core/modules/radar/capabilities/sourceMaterialNormalizer.ts"

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

type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type RadarPhase3Result = {
  independent_calls: {
    resolver: {
      request: ModuleCallRequest<RadarCaptureRequest>
      response: DispatchResponse
    }
    normalizer: {
      request: ModuleCallRequest<SourceNormalizerInput>
      response: DispatchResponse
    }
    extractor: {
      request: ModuleCallRequest<ProblemExtractorInput>
      response: DispatchResponse
    }
  }
  manual_sequence: {
    resolver_response: DispatchResponse
    normalizer_request: ModuleCallRequest<SourceNormalizerInput>
    normalizer_response: DispatchResponse
    extractor_request: ModuleCallRequest<ProblemExtractorInput>
    extractor_response: DispatchResponse
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

export async function runRadarPhase3Demo(): Promise<RadarPhase3Result> {
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
      target: "core/modules/radar/capabilities/sourceInputResolver.resolveSourceInput",
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
      target: "core/modules/radar/capabilities/sourceMaterialNormalizer.resolveSourceMaterial",
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
      target: "core/modules/radar/capabilities/problemAnalysisEngine.runProblemAnalysis",
      handler: runProblemAnalysis
    }
  })

  const resolverRequest: ModuleCallRequest<RadarCaptureRequest> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase3-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase3-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase3-resolver-trace"
    }
  }

  const normalizerRequest: ModuleCallRequest<SourceNormalizerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase3-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase3-demo"
    },
    input: {
      sourceMode: "manual",
      normalizedInput: {
        redditUrl: "",
        postText: "manual source text for standalone normalizer call",
        comments: "first comment",
        notes: "standalone normalizer request"
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase3-normalizer-trace"
    }
  }

  const extractorRequest: ModuleCallRequest<ProblemExtractorInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase3-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase3-demo"
    },
    input: {
      source: {
        url: "manual://runtime-extractor",
        title: "Manual seller issue",
        selftext: "Seller cannot decide which ad terms deserve budget.",
        subreddit: "manual",
        score: 0,
        comments: [
          {
            author: "manual_user_1",
            score: 0,
            body: "We waste spend on weak search terms."
          }
        ]
      },
      notes: "standalone extractor request"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase3-extractor-trace"
    }
  }

  const resolverResponse = await dispatcher.dispatch(resolverRequest)
  const standaloneNormalizerResponse = await dispatcher.dispatch(normalizerRequest)
  const standaloneExtractorResponse = await dispatcher.dispatch(extractorRequest)

  if (
    !resolverResponse.output ||
    typeof resolverResponse.output !== "object" ||
    !("sourceMode" in resolverResponse.output) ||
    !("normalizedInput" in resolverResponse.output)
  ) {
    throw new Error("resolver output is not compatible with source_normalizer input")
  }

  const sequenceNormalizerRequest: ModuleCallRequest<SourceNormalizerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase3-sequence-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase3-demo"
    },
    input: {
      sourceMode: resolverResponse.output.sourceMode as "reddit" | "manual",
      normalizedInput: resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase3-sequence-normalizer-trace"
    }
  }

  const sequenceNormalizerResponse = await dispatcher.dispatch(sequenceNormalizerRequest)

  if (
    !sequenceNormalizerResponse.output ||
    typeof sequenceNormalizerResponse.output !== "object" ||
    !("source" in sequenceNormalizerResponse.output)
  ) {
    throw new Error("normalizer output is not compatible with problem_extractor input")
  }

  const sequenceExtractorRequest: ModuleCallRequest<ProblemExtractorInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase3-sequence-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase3-demo"
    },
    input: {
      source: sequenceNormalizerResponse.output.source as ProblemExtractorInput["source"],
      notes:
        (resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]).notes ??
        ""
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase3-sequence-extractor-trace"
    }
  }

  const sequenceExtractorResponse = await dispatcher.dispatch(sequenceExtractorRequest)

  return {
    independent_calls: {
      resolver: {
        request: resolverRequest,
        response: resolverResponse
      },
      normalizer: {
        request: normalizerRequest,
        response: standaloneNormalizerResponse
      },
      extractor: {
        request: extractorRequest,
        response: standaloneExtractorResponse
      }
    },
    manual_sequence: {
      resolver_response: resolverResponse,
      normalizer_request: sequenceNormalizerRequest,
      normalizer_response: sequenceNormalizerResponse,
      extractor_request: sequenceExtractorRequest,
      extractor_response: sequenceExtractorResponse
    },
    invocation_ids: [
      getInvocationId(resolverResponse),
      getInvocationId(standaloneNormalizerResponse),
      getInvocationId(standaloneExtractorResponse),
      getInvocationId(sequenceNormalizerResponse),
      getInvocationId(sequenceExtractorResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runRadarPhase3Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


