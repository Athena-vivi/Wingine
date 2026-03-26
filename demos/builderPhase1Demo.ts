import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "../core/runtime/index.ts"
import { createProblemStoreAdapter } from "../core/modules/problemStoreAdapter.ts"
import { importProblemObjectToBuilderProblem } from "../core/modules/builder/adapters/problemImportAdapter.ts"
import { buildRadarToBuilderRequest } from "../core/modules/radar/contracts/radarToBuilder.ts"
import { exportProblemObjectFromRadarRecord } from "../core/modules/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../core/modules/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../core/modules/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../core/modules/radar/capabilities/sourceMaterialNormalizer.ts"
import type { FlowRequest, ProblemObject } from "../core/modules/shared/index.ts"

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
type BuilderIntakeInput = FlowRequest<ProblemObject>
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type BuilderPhase1Result = {
  builder_module: string
  standalone: {
    input_shape: string[]
    response: DispatchResponse
    output_shape: string[]
  }
  manual_sequence: {
    exporter_response: DispatchResponse
    builder_request: ModuleCallRequest<BuilderIntakeInput>
    builder_response: DispatchResponse
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

function getObjectKeys(value: unknown) {
  return value && typeof value === "object" ? Object.keys(value as Record<string, unknown>) : []
}

export async function runBuilderPhase1Demo(): Promise<BuilderPhase1Result> {
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
      target: "core/modules/radar/adapters/problemExportAdapter.exportProblemObjectFromRadarRecord",
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
      target: "core/modules/problemStoreAdapter.ts.store",
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
      target: "core/modules/radar/contracts/radarToBuilder.buildRadarToBuilderRequest",
      handler: (input) => buildRadarToBuilderRequest(input as ProblemExporterInput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.problem_spec_loader",
      system: "builder",
      actions: ["load"],
      input_contract: "radar_to_builder_transport",
      output_contract: "builder_problem_context",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/builder/adapters/problemImportAdapter.importProblemObjectToBuilderProblem",
      handler: (input) => importProblemObjectToBuilderProblem((input as BuilderIntakeInput).object)
    }
  })

  const standaloneTransport: BuilderIntakeInput = {
    contract_name: "radar_to_builder",
    producer: "radar",
    consumer: "builder",
    object: {
      id: "problem_manual://builder-standalone",
      type: "problem",
      source: {
        system: "radar",
        origin_id: "manual://builder-standalone",
        origin_ref: "manual://builder-standalone"
      },
      status: "structured",
      metadata: {
        tags: ["marketing", "manual"],
        labels: ["medium"],
        custom: {
          trend_signal: true,
          problem_type: "Marketing",
          business_stage: "Discovery",
          record_reason: "The issue is repeated."
        }
      },
      timestamps: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        observed_at: new Date().toISOString()
      },
      title: "Standalone builder intake problem",
      summary: "Repeated ad spend problem",
      description: "Seller struggles with wasted ad spend.",
      normalized_problem: "Seller struggles with wasted ad spend.",
      record_worthy: true
    },
    context: {
      request_id: "radar-to-builder-problem_manual://builder-standalone",
      trigger: "problem_ready_for_builder",
      sent_at: new Date().toISOString()
    }
  }

  const standaloneRequest: ModuleCallRequest<BuilderIntakeInput> = {
    protocol_version: "0.1.0",
    request_id: "builder-phase1-standalone-request",
    module: "builder.problem_spec_loader",
    action: "load",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: standaloneTransport,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-standalone-trace"
    }
  }

  const standaloneResponse = await dispatcher.dispatch(standaloneRequest)

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller reports high ACoS and wasted spend from poor term targeting"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-resolver-trace"
    }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-normalizer-trace"
    }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-extractor-trace"
    }
  })

  const radarRecord = buildRadarRecord({
    source: (normalizerResponse.output as { source: Parameters<typeof buildRadarRecord>[0]["source"] }).source,
    analysis: {
      reason: (extractorResponse.output as { analysis: { reason: string } }).analysis.reason,
      recordWorthy: (extractorResponse.output as { analysis: { recordWorthy: boolean } }).analysis.recordWorthy
    },
    businessStage: (
      extractorResponse.output as { fallback: { businessStage: string } }
    ).fallback.businessStage,
    signals: (
      extractorResponse.output as {
        fallback: {
          marketSignals: {
            toolSignal: boolean
            serviceSignal: boolean
            trendSignal: boolean
            emotionSignal: string
          }
        }
      }
    ).fallback.marketSignals,
    insightDraft: "Sellers are repeatedly surfacing ad-spend waste as a structured problem worth tracking."
  })

  const structurerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-structurer-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-structurer-trace"
    }
  })

  await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-store-request",
    module: "problem_radar.problem_store_adapter",
    action: "store",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: structurerResponse.output as ProblemStoreInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-store-trace"
    }
  })

  const exporterResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-exporter-request",
    module: "problem_radar.problem_exporter",
    action: "export",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-exporter-trace"
    }
  })

  const builderRequest: ModuleCallRequest<BuilderIntakeInput> = {
    protocol_version: "0.1.0",
    request_id: "builder-phase1-radar-intake-request",
    module: "builder.problem_spec_loader",
    action: "load",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-phase1-demo"
    },
    input: exporterResponse.output as BuilderIntakeInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "builder-phase1-radar-intake-trace"
    }
  }

  const builderResponse = await dispatcher.dispatch(builderRequest)

  return {
    builder_module: "builder.problem_spec_loader",
    standalone: {
      input_shape: getObjectKeys(standaloneTransport),
      response: standaloneResponse,
      output_shape: getObjectKeys(standaloneResponse.output)
    },
    manual_sequence: {
      exporter_response: exporterResponse,
      builder_request: builderRequest,
      builder_response: builderResponse
    },
    invocation_ids: [
      getInvocationId(standaloneResponse),
      getInvocationId(resolverResponse),
      getInvocationId(normalizerResponse),
      getInvocationId(extractorResponse),
      getInvocationId(structurerResponse),
      getInvocationId(exporterResponse),
      getInvocationId(builderResponse)
    ],
    activity_count: activityLogStore.count(),
    activity_logs: activityLogStore.list()
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runBuilderPhase1Demo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


