import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher
} from "../core/runtime/index.ts"
import { classifyProblem, type ProblemClassifierInput } from "../core/scoring/problemClassifier.ts"
import { evaluateProblem, type ProblemEvaluatorInput } from "../core/scoring/problemEvaluator.ts"
import { resolveProblemDecision, type ProblemDecisionInput } from "../core/betting/problemDecisionResolver.ts"
import { buildModuleIOContracts } from "../core/modules/ioContractBuilder.ts"
import { buildSystemSpec } from "../core/modules/systemSpecBuilder.ts"
import { planStructuralModules } from "../core/modules/structuralModulePlanner.ts"
import { buildBuilderWorkspaceRecord } from "../core/modules/builder/capabilities/builderRecordManager.ts"
import { resolveUITemplate } from "../core/modules/builder/capabilities/uiTemplateManager.ts"
import { importProblemObjectToBuilderProblem } from "../core/modules/builder/adapters/problemImportAdapter.ts"
import { defaultTemplate } from "../core/modules/builder/data/defaultTemplate.ts"
import { buildRadarToBuilderRequest } from "../core/modules/radar/contracts/radarToBuilder.ts"
import { exportProblemObjectFromRadarRecord } from "../core/modules/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../core/modules/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../core/modules/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../core/modules/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../core/modules/radar/capabilities/sourceMaterialNormalizer.ts"
import type { FlowRequest, ProblemObject, ScoreObject } from "../core/modules/shared/index.ts"
import type { Problem } from "../core/modules/builder/types/builder.ts"

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
type ProblemExporterInput = ProblemStructurerInput
type BuilderIntakeInput = FlowRequest<ProblemObject>
type BuilderGoalInput = Problem
type BuilderGoalOutput = {
  name: string
  outcome: string
  builder_record: ReturnType<typeof buildBuilderWorkspaceRecord>
}
type StructuralModuleList = {
  modules: string[]
}
type ModuleIOContractList = {
  contracts: Array<{
    from: string
    to: string
  }>
}
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type ProblemClassificationResult = {
  input_problem: string
  problem_type: string
  score: number
  decision: string
  builder_called: boolean
}

type ProblemClassificationDemoResult = {
  problems: ProblemClassificationResult[]
}

function adaptCaptureRequest(input: RadarCaptureRequest) {
  return {
    redditUrl: input.source.url ?? "",
    postText: input.raw_text ?? "",
    comments: "",
    notes: `source_provider:${input.source.provider}`
  }
}

function resolveSystemGoal(problem: Problem) {
  const template = resolveUITemplate({
    templateId: defaultTemplate.id,
    templates: [defaultTemplate]
  }).template

  const builderRecord = buildBuilderWorkspaceRecord({
    problemId: problem.id,
    problems: [problem],
    workflows: [],
    capabilitySets: [],
    outputs: [],
    template
  })

  return {
    name: builderRecord.problem.title,
    outcome: builderRecord.template.description,
    builder_record: builderRecord
  }
}

function createRuntimeForClassification() {
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
      module_id: "scoring.problem_classifier",
      system: "scoring",
      actions: ["classify"],
      input_contract: "problem_object",
      output_contract: "classified_problem_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/scoring/problemClassifier.ts.classifyProblem",
      handler: (input) => classifyProblem(input as ProblemClassifierInput)
    }
  })

  registry.register({
    module: {
      module_id: "scoring.problem_evaluator",
      system: "scoring",
      actions: ["evaluate"],
      input_contract: "problem_object",
      output_contract: "score_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/scoring/problemEvaluator.ts.evaluateProblem",
      handler: (input) => evaluateProblem(input as ProblemEvaluatorInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.problem_decision_resolver",
      system: "betting",
      actions: ["resolve"],
      input_contract: "score_object",
      output_contract: "bet_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/betting/problemDecisionResolver.ts.resolveProblemDecision",
      handler: (input) => resolveProblemDecision(input as ProblemDecisionInput)
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

  registry.register({
    module: {
      module_id: "builder.system_goal_resolver",
      system: "builder",
      actions: ["resolve"],
      input_contract: "builder_problem_context",
      output_contract: "system_goal",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/builder/capabilities/builderRecordManager.buildBuilderWorkspaceRecord",
      handler: (input) => resolveSystemGoal(input as BuilderGoalInput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.structural_module_planner",
      system: "builder",
      actions: ["plan"],
      input_contract: "system_goal",
      output_contract: "structural_module_list",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/structuralModulePlanner.ts.planStructuralModules",
      handler: (input) => planStructuralModules(input as BuilderGoalOutput)
    }
  })

  registry.register({
    module: {
      module_id: "builder.io_contract_builder",
      system: "builder",
      actions: ["build"],
      input_contract: "structural_module_list",
      output_contract: "module_io_contract_list",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/ioContractBuilder.ts.buildModuleIOContracts",
      handler: (input) => buildModuleIOContracts(input as StructuralModuleList)
    }
  })

  registry.register({
    module: {
      module_id: "builder.system_spec_builder",
      system: "builder",
      actions: ["build"],
      input_contract: "system_spec_builder_input",
      output_contract: "system_spec",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "core/modules/systemSpecBuilder.ts.buildSystemSpec",
      handler: (input) =>
        buildSystemSpec(
          input as {
            modules: string[]
            contracts: Array<{ from: string; to: string }>
          }
        )
    }
  })

  return { dispatcher, activityLogStore }
}

async function runSingleProblem(problemText: string): Promise<ProblemClassificationResult> {
  const { dispatcher } = createRuntimeForClassification()

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-resolver-${problemText}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: problemText
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-normalizer-${problemText}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-extractor-${problemText}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: {
      timestamp: new Date().toISOString()
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
    insightDraft: "Structured into a problem-classification validation record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-structurer-${problemText}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const classifiedProblemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-problem-${problemText}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      problem: problemResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const classifiedProblem = classifiedProblemResponse.output as ProblemObject

  const scoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-score-${problemText}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      problem: classifiedProblem
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const decisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `classify-decision-${problemText}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "problem-classification-demo"
    },
    input: {
      score: scoreResponse.output as ScoreObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })

  const decision = String(
    (decisionResponse.output as { metadata: { custom: { decision?: string } } }).metadata.custom.decision ??
      (decisionResponse.output as { resource_allocation: { action: string } }).resource_allocation.action
  )

  let builderCalled = false

  if (decision === "invest") {
    builderCalled = true

    const exporterResponse = await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-exporter-${problemText}`,
      module: "problem_radar.problem_exporter",
      action: "export",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: radarRecord,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

    const problemSpecResponse = await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-problem-spec-${problemText}`,
      module: "builder.problem_spec_loader",
      action: "load",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: exporterResponse.output as BuilderIntakeInput,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

    const goalResponse = await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-goal-${problemText}`,
      module: "builder.system_goal_resolver",
      action: "resolve",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: problemSpecResponse.output as BuilderGoalInput,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

    const structuralResponse = await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-structural-${problemText}`,
      module: "builder.structural_module_planner",
      action: "plan",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: goalResponse.output as BuilderGoalOutput,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

    const contractsResponse = await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-contracts-${problemText}`,
      module: "builder.io_contract_builder",
      action: "build",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: structuralResponse.output as StructuralModuleList,
      meta: {
        timestamp: new Date().toISOString()
      }
    })

    await dispatcher.dispatch({
      protocol_version: "0.1.0",
      request_id: `classify-system-spec-${problemText}`,
      module: "builder.system_spec_builder",
      action: "build",
      caller: {
        system: "runtime_demo",
        role: "runtime",
        id: "problem-classification-demo"
      },
      input: {
        modules: (structuralResponse.output as StructuralModuleList).modules,
        contracts: (contractsResponse.output as ModuleIOContractList).contracts
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    })
  }

  return {
    input_problem: problemText,
    problem_type: String(classifiedProblem.metadata.custom.type ?? "general"),
    score: (scoreResponse.output as ScoreObject).weighted_score,
    decision,
    builder_called: builderCalled
  }
}

export async function runProblemClassificationDemo(): Promise<ProblemClassificationDemoResult> {
  const problems = [
    "Amazon seller has high ACoS and wasted ad spend",
    "User wants to generate faceless YouTube videos at scale",
    "User needs to analyze SaaS metrics and detect churn risk"
  ]

  const results: ProblemClassificationResult[] = []

  for (const problem of problems) {
    results.push(await runSingleProblem(problem))
  }

  return {
    problems: results
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runProblemClassificationDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


