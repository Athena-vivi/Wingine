import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { generateContentDraft, type ContentDraft, type ContentDraftInput } from "./contentDraftGenerator.ts"
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
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type ContentDraftDemoResult = {
  standalone: {
    input_problem: ProblemObject
    response: DispatchResponse
  }
  manual_chain: {
    input_problem: ProblemObject
    response: DispatchResponse
  }
}

function adaptCaptureRequest(input: RadarCaptureRequest) {
  return {
    redditUrl: input.source.url ?? "",
    postText: input.raw_text ?? "",
    comments: "",
    notes: `source_provider:${input.source.provider}`
  }
}

function createRuntimeForContentDraft() {
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

  registry.register({
    module: {
      module_id: "content_system.draft_generator",
      system: "content_system",
      actions: ["generate"],
      input_contract: "problem_object",
      output_contract: "content_draft",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/contentDraftGenerator.generateContentDraft",
      handler: (input) => generateContentDraft(input as ContentDraftInput)
    }
  })

  return {
    dispatcher,
    activityLogStore
  }
}

export async function runContentDraftDemo(): Promise<ContentDraftDemoResult> {
  const { dispatcher } = createRuntimeForContentDraft()

  const standaloneProblem: ProblemObject = {
    id: "problem_manual://content-draft-standalone",
    type: "problem",
    source: {
      system: "radar",
      origin_id: "manual://content-draft-standalone",
      origin_ref: "manual://content-draft-standalone"
    },
    status: "structured",
    metadata: {
      tags: ["ads"],
      labels: ["pain"],
      custom: {
        type: "ads",
        business_stage: "growth"
      }
    },
    timestamps: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      observed_at: new Date().toISOString()
    },
    title: "High ACoS is wasting Amazon ad budget",
    summary: "Seller reports ad spend waste and weak targeting performance.",
    description: "Manual test problem for content draft generation.",
    normalized_problem: "amazon seller is wasting budget because ad targeting is inefficient",
    record_worthy: true
  }

  const standaloneRequest: ModuleCallRequest<ContentDraftInput> = {
    protocol_version: "0.1.0",
    request_id: "content-draft-standalone-request",
    module: "content_system.draft_generator",
    action: "generate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: {
      problem: standaloneProblem
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-standalone-trace"
    }
  }

  const standaloneResponse = await dispatcher.dispatch(standaloneRequest)

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "content-draft-radar-resolver-request",
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: "seller complains about high ACoS and wasted ad spend"
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-radar-resolver-trace"
    }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "content-draft-radar-normalizer-request",
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-radar-normalizer-trace"
    }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "content-draft-radar-extractor-request",
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-radar-extractor-trace"
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
    insightDraft: "This problem can be turned into a lightweight content draft."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: "content-draft-radar-problem-request",
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-radar-problem-trace"
    }
  })

  const manualRequest: ModuleCallRequest<ContentDraftInput> = {
    protocol_version: "0.1.0",
    request_id: "content-draft-manual-chain-request",
    module: "content_system.draft_generator",
    action: "generate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "content-draft-demo"
    },
    input: {
      problem: problemResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: "content-draft-manual-chain-trace"
    }
  }

  const manualResponse = await dispatcher.dispatch(manualRequest)
  const standaloneDraft = standaloneResponse.output as ContentDraft
  const manualDraft = manualResponse.output as ContentDraft

  if (!standaloneDraft?.title || !manualDraft?.title) {
    throw new Error("content draft was not produced")
  }

  return {
    standalone: {
      input_problem: standaloneProblem,
      response: standaloneResponse
    },
    manual_chain: {
      input_problem: problemResponse.output as ProblemObject,
      response: manualResponse
    }
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runContentDraftDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
