import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
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

type RadarPhase2Result = {
  independent_calls: {
    resolver: {
      request: ModuleCallRequest<RadarCaptureRequest>
      response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>
    }
    normalizer: {
      request: ModuleCallRequest<SourceNormalizerInput>
      response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>
    }
  }
  manual_sequence: {
    resolver_response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>
    normalizer_request: ModuleCallRequest<SourceNormalizerInput>
    normalizer_response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>
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

function getInvocationId(response: Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>) {
  const custom = response.meta.custom

  if (!custom || typeof custom.invocation_id !== "string") {
    throw new Error("invocation_id missing from response meta")
  }

  return custom.invocation_id
}

export async function runRadarPhase2Demo(): Promise<RadarPhase2Result> {
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

  const resolverRequest: ModuleCallRequest<RadarCaptureRequest> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase2-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase2-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase2-resolver-trace"
    }
  }

  const normalizerRequest: ModuleCallRequest<SourceNormalizerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase2-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase2-demo"
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
      trace_id: "radar-phase2-normalizer-trace"
    }
  }

  const resolverResponse = await dispatcher.dispatch(resolverRequest)
  const standaloneNormalizerResponse = await dispatcher.dispatch(normalizerRequest)

  if (
    !resolverResponse.output ||
    typeof resolverResponse.output !== "object" ||
    !("sourceMode" in resolverResponse.output) ||
    !("normalizedInput" in resolverResponse.output)
  ) {
    throw new Error("resolver output is not compatible with source_normalizer input")
  }

  const manualSequenceNormalizerRequest: ModuleCallRequest<SourceNormalizerInput> = {
    protocol_version: "0.1.0",
    request_id: "radar-phase2-manual-sequence-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "radar-phase2-demo"
    },
    input: {
      sourceMode: resolverResponse.output.sourceMode as "reddit" | "manual",
      normalizedInput: resolverResponse.output.normalizedInput as SourceNormalizerInput["normalizedInput"]
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "radar-phase2-manual-sequence-trace"
    }
  }

  const manualSequenceNormalizerResponse = await dispatcher.dispatch(manualSequenceNormalizerRequest)

  return {
    independent_calls: {
      resolver: {
        request: resolverRequest,
        response: resolverResponse
      },
      normalizer: {
        request: normalizerRequest,
        response: standaloneNormalizerResponse
      }
    },
    manual_sequence: {
      resolver_response: resolverResponse,
      normalizer_request: manualSequenceNormalizerRequest,
      normalizer_response: manualSequenceNormalizerResponse
    },
    invocation_ids: [
      getInvocationId(resolverResponse),
      getInvocationId(standaloneNormalizerResponse),
      getInvocationId(manualSequenceNormalizerResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runRadarPhase2Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
