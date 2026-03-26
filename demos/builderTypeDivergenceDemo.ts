import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher
} from "../core/runtime/index.ts"
import { classifyProblem, type ProblemClassifierInput } from "../core/scoring/problemClassifier.ts"
import { evaluateProblem, type ProblemEvaluatorInput } from "../core/scoring/problemEvaluator.ts"
import { resolveProblemDecision, type ProblemDecisionInput } from "../core/betting/problemDecisionResolver.ts"
import { planStructuralModules } from "../core/modules/structuralModulePlanner.ts"
import { buildBuilderWorkspaceRecord } from "../core/modules/builder/capabilities/builderRecordManager.ts"
import { resolveUITemplate } from "../core/modules/builder/capabilities/uiTemplateManager.ts"
import { importProblemObjectToBuilderProblem } from "../core/modules/builder/adapters/problemImportAdapter.ts"
import { defaultTemplate } from "../core/modules/builder/data/defaultTemplate.ts"
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
type BuilderIntakeInput = FlowRequest<ProblemObject>
type BuilderGoalInput = Problem
type BuilderGoalOutput = {
  name: string
  outcome: string
  problem_type: string
  builder_record: ReturnType<typeof buildBuilderWorkspaceRecord>
}
type StructuralModuleList = {
  modules: string[]
}
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type DivergenceResult = {
  input_problem: string
  problem_type: string
  modules: string[]
  invocation_ids: string[]
  activity_count: number
}

type BuilderTypeDivergenceResult = {
  problems: DivergenceResult[]
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
    problem_type: builderRecord.problem.tag,
    builder_record: builderRecord
  }
}

function createRuntimeForDivergence() {
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

  return {
    dispatcher,
    activityLogStore
  }
}

async function runSingleProblem(problemText: string): Promise<DivergenceResult> {
  const { dispatcher, activityLogStore } = createRuntimeForDivergence()
  const responses: DispatchResponse[] = []

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-resolver-${problemText}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
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
  responses.push(resolverResponse)

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-normalizer-${problemText}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(normalizerResponse)

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-extractor-${problemText}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(extractorResponse)

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
    insightDraft: "Structured into a builder divergence validation record."
  })

  const problemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-structurer-${problemText}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(problemResponse)

  const classifiedProblemResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-classifier-${problemText}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      problem: problemResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(classifiedProblemResponse)

  const scoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-score-${problemText}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      problem: classifiedProblemResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(scoreResponse)

  const decisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-decision-${problemText}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      score: scoreResponse.output as ScoreObject
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(decisionResponse)

  const decision = String(
    (decisionResponse.output as { metadata: { custom: { decision?: string } } }).metadata.custom.decision ??
      (decisionResponse.output as { resource_allocation: { action: string } }).resource_allocation.action
  )

  if (decision !== "invest") {
    throw new Error("expected classified problem to pass builder gate")
  }

  const problemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-problem-spec-${problemText}`,
    module: "builder.problem_spec_loader",
    action: "load",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: {
      contract_name: "radar_to_builder",
      producer: "radar",
      consumer: "builder",
      object: classifiedProblemResponse.output as ProblemObject,
      context: {
        request_id: `diverge-problem-spec-${problemText}`,
        trigger: "problem_classification",
        sent_at: new Date().toISOString()
      }
    } as BuilderIntakeInput,
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(problemSpecResponse)

  const goalResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-goal-${problemText}`,
    module: "builder.system_goal_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: problemSpecResponse.output as BuilderGoalInput,
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(goalResponse)

  const structuralResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `diverge-structural-${problemText}`,
    module: "builder.structural_module_planner",
    action: "plan",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "builder-type-divergence-demo"
    },
    input: goalResponse.output as BuilderGoalOutput,
    meta: {
      timestamp: new Date().toISOString()
    }
  })
  responses.push(structuralResponse)

  return {
    input_problem: problemText,
    problem_type: String(
      (classifiedProblemResponse.output as ProblemObject).metadata.custom.type ?? "general"
    ),
    modules: (structuralResponse.output as StructuralModuleList).modules,
    invocation_ids: responses.map(getInvocationId),
    activity_count: activityLogStore.count()
  }
}

export async function runBuilderTypeDivergenceDemo(): Promise<BuilderTypeDivergenceResult> {
  const problems = [
    "Amazon seller has high ACoS and wasted ad spend",
    "User wants to generate faceless YouTube videos at scale",
    "User needs to analyze SaaS metrics and detect churn risk"
  ]

  const results: DivergenceResult[] = []

  for (const problem of problems) {
    results.push(await runSingleProblem(problem))
  }

  return {
    problems: results
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runBuilderTypeDivergenceDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}


