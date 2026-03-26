import {
  createActivityLogStore,
  createModuleRegistry,
  createProtocolDispatcher,
  type ModuleCallRequest
} from "./index.ts"
import { classifyProblem, type ProblemClassifierInput } from "./problemClassifier.ts"
import { evaluateProblem, type ProblemEvaluatorInput } from "./problemEvaluator.ts"
import { resolveProblemDecision, type ProblemDecisionInput } from "./problemDecisionResolver.ts"
import { buildModuleIOContracts } from "./ioContractBuilder.ts"
import { buildSystemSpec } from "./systemSpecBuilder.ts"
import { planStructuralModules } from "./structuralModulePlanner.ts"
import { evaluateSystemSpec, type SystemEvaluatorInput } from "./systemEvaluator.ts"
import { resolveBetDecision, type DecisionInput } from "./bettingDecisionResolver.ts"
import {
  recordDecisionFeedback,
  type DecisionFeedbackInput,
  type DecisionFeedbackRecord
} from "./decisionFeedbackRecorder.ts"
import { buildBuilderWorkspaceRecord } from "../../apps/builder/capabilities/builderRecordManager.ts"
import { resolveUITemplate } from "../../apps/builder/capabilities/uiTemplateManager.ts"
import { importProblemObjectToBuilderProblem } from "../../apps/builder/adapters/problemImportAdapter.ts"
import { defaultTemplate } from "../../apps/builder/data/defaultTemplate.ts"
import { exportProblemObjectFromRadarRecord } from "../../apps/radar/adapters/problemExportAdapter.ts"
import { runProblemAnalysis } from "../../apps/radar/capabilities/problemAnalysisEngine.ts"
import { buildRadarRecord } from "../../apps/radar/capabilities/radarRecordBuilder.ts"
import { resolveSourceInput } from "../../apps/radar/capabilities/sourceInputResolver.ts"
import { resolveSourceMaterial } from "../../apps/radar/capabilities/sourceMaterialNormalizer.ts"
import type { BetObject, FlowRequest, ProblemObject, ScoreObject } from "../shared/index.ts"
import type { Problem } from "../../apps/builder/types/builder.ts"

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
  problem_type?: string
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
type SystemSpec = {
  type: "system_spec"
  modules: string[]
  flows: Array<{
    from: string
    to: string
  }>
}
type DispatchResponse = Awaited<ReturnType<ReturnType<typeof createProtocolDispatcher>["dispatch"]>>

type ProblemLoopResult = {
  input_problem: string
  problem_type: string
  problem_summary: string
  problem_score: number
  problem_score_breakdown: {
    signal_strength: number
    business_value: number
    actionability: number
    frequency_hint: number
  }
  system_spec_modules: string[]
  weighted_score: number
  confidence: number
  system_score_reason: string
  threshold: number
  decision: string
  feedback_record: DecisionFeedbackRecord
  invocation_ids: string[]
  activity_count: number
}

type FullLoopValidationResult = {
  problems: ProblemLoopResult[]
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

function createRuntimeForLoop() {
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
      target: "apps/builder/adapters/problemImportAdapter.importProblemObjectToBuilderProblem",
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
      target: "apps/builder/capabilities/builderRecordManager.buildBuilderWorkspaceRecord",
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
      target: "packages/runtime/structuralModulePlanner.planStructuralModules",
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
      target: "packages/runtime/ioContractBuilder.buildModuleIOContracts",
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
      target: "packages/runtime/systemSpecBuilder.buildSystemSpec",
      handler: (input) =>
        buildSystemSpec(
          input as {
            modules: string[]
            contracts: Array<{ from: string; to: string }>
          }
        )
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
      target: "packages/runtime/problemClassifier.classifyProblem",
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
      target: "packages/runtime/problemEvaluator.evaluateProblem",
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
      target: "packages/runtime/problemDecisionResolver.resolveProblemDecision",
      handler: (input) => resolveProblemDecision(input as ProblemDecisionInput)
    }
  })

  registry.register({
    module: {
      module_id: "scoring.system_evaluator",
      system: "scoring",
      actions: ["evaluate"],
      input_contract: "system_spec",
      output_contract: "score_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/systemEvaluator.evaluateSystemSpec",
      handler: (input) => evaluateSystemSpec(input as SystemEvaluatorInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.decision_resolver",
      system: "betting",
      actions: ["resolve"],
      input_contract: "score_object",
      output_contract: "bet_object",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/bettingDecisionResolver.resolveBetDecision",
      handler: (input) => resolveBetDecision(input as DecisionInput)
    }
  })

  registry.register({
    module: {
      module_id: "betting.decision_feedback_recorder",
      system: "betting",
      actions: ["record"],
      input_contract: "bet_object",
      output_contract: "decision_feedback_record",
      module_version: "0.1.0",
      status: "active"
    },
    execution: {
      mode: "local",
      target: "packages/runtime/decisionFeedbackRecorder.recordDecisionFeedback",
      handler: (input) => recordDecisionFeedback(input as DecisionFeedbackInput)
    }
  })

  return {
    dispatcher,
    activityLogStore
  }
}

async function runSingleProblem(problemText: string): Promise<ProblemLoopResult> {
  const { dispatcher, activityLogStore } = createRuntimeForLoop()

  const responses: DispatchResponse[] = []

  const resolverResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-resolver-${problemText}`,
    module: "problem_radar.source_input_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      source: {
        provider: "manual"
      },
      raw_text: problemText
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-resolver-trace-${problemText}`
    }
  })
  responses.push(resolverResponse)

  const normalizerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-normalizer-${problemText}`,
    module: "problem_radar.source_normalizer",
    action: "normalize",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      sourceMode: (resolverResponse.output as SourceNormalizerInput).sourceMode,
      normalizedInput: (resolverResponse.output as SourceNormalizerInput).normalizedInput
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-normalizer-trace-${problemText}`
    }
  })
  responses.push(normalizerResponse)

  const extractorResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-extractor-${problemText}`,
    module: "problem_radar.problem_extractor",
    action: "extract",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      source: (normalizerResponse.output as { source: ProblemExtractorInput["source"] }).source,
      notes: ((resolverResponse.output as SourceNormalizerInput).normalizedInput.notes ?? "")
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-extractor-trace-${problemText}`
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
    insightDraft: "Structured into a minimum loop validation record."
  })

  const structurerResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-structurer-${problemText}`,
    module: "problem_radar.problem_structurer",
    action: "structure",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: radarRecord,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-structurer-trace-${problemText}`
    }
  })
  responses.push(structurerResponse)

  const problemObject = structurerResponse.output as ProblemObject

  const classifierResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-classifier-${problemText}`,
    module: "scoring.problem_classifier",
    action: "classify",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      problem: problemObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-classifier-trace-${problemText}`
    }
  })
  responses.push(classifierResponse)

  const problemScoreResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-problem-score-${problemText}`,
    module: "scoring.problem_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      problem: classifierResponse.output as ProblemObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-problem-score-trace-${problemText}`
    }
  })
  responses.push(problemScoreResponse)

  const problemDecisionResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-problem-decision-${problemText}`,
    module: "betting.problem_decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      score: problemScoreResponse.output as ScoreObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-problem-decision-trace-${problemText}`
    }
  })
  responses.push(problemDecisionResponse)

  const problemDecision = String(
    (
      problemDecisionResponse.output as {
        metadata: { custom: { decision?: string } }
      }
    ).metadata.custom.decision ??
      (
        problemDecisionResponse.output as {
          resource_allocation: { action: string }
        }
      ).resource_allocation.action
  )

  if (problemDecision !== "invest") {
    throw new Error("problem did not pass builder gate during full loop validation")
  }

  const problemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-problem-spec-${problemText}`,
    module: "builder.problem_spec_loader",
    action: "load",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      contract_name: "radar_to_builder",
      producer: "radar",
      consumer: "builder",
      object: classifierResponse.output as ProblemObject,
      context: {
        request_id: `loop-problem-spec-${problemText}`,
        trigger: "problem_gate_pass",
        sent_at: new Date().toISOString()
      }
    } as BuilderIntakeInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-problem-spec-trace-${problemText}`
    }
  })
  responses.push(problemSpecResponse)

  const goalResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-goal-${problemText}`,
    module: "builder.system_goal_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: problemSpecResponse.output as BuilderGoalInput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-goal-trace-${problemText}`
    }
  })
  responses.push(goalResponse)

  const structuralResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-structural-${problemText}`,
    module: "builder.structural_module_planner",
    action: "plan",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: goalResponse.output as BuilderGoalOutput,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-structural-trace-${problemText}`
    }
  })
  responses.push(structuralResponse)

  const contractsResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-contracts-${problemText}`,
    module: "builder.io_contract_builder",
    action: "build",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: structuralResponse.output as StructuralModuleList,
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-contracts-trace-${problemText}`
    }
  })
  responses.push(contractsResponse)

  const systemSpecResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-system-spec-${problemText}`,
    module: "builder.system_spec_builder",
    action: "build",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      modules: (structuralResponse.output as StructuralModuleList).modules,
      contracts: (contractsResponse.output as ModuleIOContractList).contracts
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-system-spec-trace-${problemText}`
    }
  })
  responses.push(systemSpecResponse)

  const scoringResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-score-${problemText}`,
    module: "scoring.system_evaluator",
    action: "evaluate",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      spec: systemSpecResponse.output as SystemSpec
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-score-trace-${problemText}`
    }
  })
  responses.push(scoringResponse)

  const bettingResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-bet-${problemText}`,
    module: "betting.decision_resolver",
    action: "resolve",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      score: scoringResponse.output as ScoreObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-bet-trace-${problemText}`
    }
  })
  responses.push(bettingResponse)

  const feedbackResponse = await dispatcher.dispatch({
    protocol_version: "0.1.0",
    request_id: `loop-feedback-${problemText}`,
    module: "betting.decision_feedback_recorder",
    action: "record",
    caller: {
      system: "runtime_demo",
      role: "runtime",
      id: "full-loop-demo"
    },
    input: {
      bet: bettingResponse.output as BetObject
    },
    meta: {
      timestamp: new Date().toISOString(),
      trace_id: `loop-feedback-trace-${problemText}`
    }
  })
  responses.push(feedbackResponse)

  const betObject = bettingResponse.output as BetObject
  const systemSpec = systemSpecResponse.output as SystemSpec
  const scoreObject = scoringResponse.output as ScoreObject
  const feedbackRecord = feedbackResponse.output as DecisionFeedbackRecord
  const problemScoreObject = problemScoreResponse.output as ScoreObject

  return {
    input_problem: problemText,
    problem_type: String((classifierResponse.output as ProblemObject).metadata.custom.type ?? "general"),
    problem_summary: problemObject.summary,
    problem_score: problemScoreObject.weighted_score,
    problem_score_breakdown: problemScoreObject.metadata.custom.score_breakdown as {
      signal_strength: number
      business_value: number
      actionability: number
      frequency_hint: number
    },
    system_spec_modules: systemSpec.modules,
    weighted_score: scoreObject.weighted_score,
    confidence: scoreObject.confidence,
    system_score_reason: String(scoreObject.metadata.custom.system_score_reason ?? ""),
    threshold: Number((betObject.metadata.custom.threshold as number | undefined) ?? 0.55),
    decision: String(betObject.metadata.custom.decision ?? betObject.resource_allocation.action),
    feedback_record: feedbackRecord,
    invocation_ids: responses.map(getInvocationId),
    activity_count: activityLogStore.count()
  }
}

export async function runFullLoopValidationDemo(): Promise<FullLoopValidationResult> {
  const problems = [
    "Amazon seller has high ACoS and wasted ad spend",
    "User wants to generate faceless YouTube videos at scale",
    "User needs to analyze SaaS metrics and detect churn risk"
  ]

  const results: ProblemLoopResult[] = []

  for (const problem of problems) {
    results.push(await runSingleProblem(problem))
  }

  return {
    problems: results
  }
}

if (import.meta.url === new URL(process.argv[1], "file://").href) {
  runFullLoopValidationDemo()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    })
}
